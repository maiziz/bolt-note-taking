import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { db } from "@/lib/db";
import { ArrowLeft, Clock, Eye } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

async function getNote(id: string) {
  const { data: notes, error } = await db
    .from('notes')
    .select('*')
    .eq('id', id)
    .eq('is_public', true)
    .limit(1);
  
  if (error || !notes || notes.length === 0) return null;
  return notes[0];
}

export default async function PublicNotePage({
  params: { id },
}: {
  params: { id: string };
}) {
  const note = await getNote(id);

  if (!note) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/public">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Public Notes
          </Button>
        </Link>

        <Card className="p-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">{note.title}</h1>
              <div className="flex items-center space-x-1 text-gray-500">
                <Eye className="w-5 h-5" />
                <span>Public Note</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-gray-500">
              <Clock className="w-4 h-4" />
              <span>
                {new Date(note.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
