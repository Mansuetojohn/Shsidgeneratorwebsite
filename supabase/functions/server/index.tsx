import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-d5fd1e67/health", (c) => {
  return c.json({ status: "ok" });
});

// Get generation count
app.get("/make-server-d5fd1e67/generation-count", async (c) => {
  try {
    const count = await kv.get("id_generation_count");
    return c.json({ count: count || 0 });
  } catch (error) {
    console.error("Error getting generation count:", error);
    return c.json({ error: "Failed to get count" }, 500);
  }
});

// Save ID generation record
app.post("/make-server-d5fd1e67/save-id", async (c) => {
  try {
    const body = await c.req.json();
    const { studentData, frontImage, backImage } = body;

    // Get current count
    const currentCount = (await kv.get("id_generation_count")) || 0;
    
    // Check if limit reached
    if (currentCount >= 50) {
      return c.json({ 
        error: "Generation limit reached. Maximum 50 IDs allowed.",
        limitReached: true 
      }, 403);
    }

    // Generate unique ID for this record
    const recordId = `id_record_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Save the record
    const record = {
      id: recordId,
      studentData,
      frontImage,
      backImage,
      generatedAt: new Date().toISOString(),
      generatedBy: "system"
    };

    await kv.set(recordId, record);
    
    // Update count
    await kv.set("id_generation_count", currentCount + 1);
    
    // Add to records list
    const recordsList = (await kv.get("id_records_list")) || [];
    recordsList.push(recordId);
    await kv.set("id_records_list", recordsList);

    return c.json({ 
      success: true, 
      recordId,
      remainingGenerations: 50 - (currentCount + 1)
    });
  } catch (error) {
    console.error("Error saving ID record:", error);
    return c.json({ error: "Failed to save ID record" }, 500);
  }
});

// Get all ID records (Admin only)
app.get("/make-server-d5fd1e67/admin/records", async (c) => {
  try {
    const recordsList = (await kv.get("id_records_list")) || [];
    const records = [];

    for (const recordId of recordsList) {
      const record = await kv.get(recordId);
      if (record) {
        records.push(record);
      }
    }

    // Sort by date (newest first)
    records.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());

    return c.json({ records, total: records.length });
  } catch (error) {
    console.error("Error fetching records:", error);
    return c.json({ error: "Failed to fetch records" }, 500);
  }
});

// Delete a record (Admin only)
app.delete("/make-server-d5fd1e67/admin/records/:id", async (c) => {
  try {
    const recordId = c.req.param("id");
    
    // Delete the record
    await kv.del(recordId);
    
    // Remove from list
    const recordsList = (await kv.get("id_records_list")) || [];
    const updatedList = recordsList.filter((id: string) => id !== recordId);
    await kv.set("id_records_list", updatedList);
    
    // Decrement count
    const currentCount = (await kv.get("id_generation_count")) || 0;
    if (currentCount > 0) {
      await kv.set("id_generation_count", currentCount - 1);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting record:", error);
    return c.json({ error: "Failed to delete record" }, 500);
  }
});

// Reset all records (Admin only - use with caution)
app.post("/make-server-d5fd1e67/admin/reset", async (c) => {
  try {
    const recordsList = (await kv.get("id_records_list")) || [];
    
    // Delete all records
    for (const recordId of recordsList) {
      await kv.del(recordId);
    }
    
    // Reset list and count
    await kv.set("id_records_list", []);
    await kv.set("id_generation_count", 0);

    return c.json({ success: true, message: "All records cleared" });
  } catch (error) {
    console.error("Error resetting records:", error);
    return c.json({ error: "Failed to reset records" }, 500);
  }
});

Deno.serve(app.fetch);