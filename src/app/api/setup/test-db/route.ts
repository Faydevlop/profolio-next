import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export async function POST(req: NextRequest) {
    try {
        const { mongoUri } = await req.json();

        if (!mongoUri) {
            return NextResponse.json({ ok: false, error: "MongoDB URI is required" }, { status: 400 });
        }

        // Attempt to connect to MongoDB with a timeout
        const client = new MongoClient(mongoUri, {
            connectTimeoutMS: 5000,
            serverSelectionTimeoutMS: 5000,
        });

        await client.connect();
        await client.db().admin().listDatabases(); // Ensure we can actually list/interact
        await client.close();

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("Database connection test failed:", err);
        const message = err instanceof Error ? err.message : "Failed to connect to MongoDB. Please check your URI.";
        return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }
}
