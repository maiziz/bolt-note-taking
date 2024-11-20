"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { Globe, Lock, Plus, Trash2, Eye, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
  is_public: boolean;
}

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState({ title: "", content: "", is_public: false });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchNotes();
    checkSession();
  }, []);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/signin");
    }
  };

  const fetchNotes = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createNote = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to create notes");
        return;
      }

      console.log("Creating note with:", {
        title: newNote.title,
        content: newNote.content,
        user_id: session.user.id,
        is_public: newNote.is_public,
      });

      const { data, error } = await supabase.from("notes").insert([
        {
          title: newNote.title,
          content: newNote.content,
          user_id: session.user.id,
          is_public: newNote.is_public,
        },
      ]).select();

      if (error) {
        console.error("Error details:", error);
        throw error;
      }

      console.log("Note created successfully:", data);
      toast.success("Note created successfully!");
      setNewNote({ title: "", content: "", is_public: false });
      fetchNotes();
    } catch (error) {
      console.error("Error creating note:", error);
      toast.error("Failed to create note. Please try again.");
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) throw error;

      toast.success("Note deleted successfully!");
      fetchNotes();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/signin");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900">My Notes</h1>
            <Link href="/public" className="text-sm text-indigo-600 hover:text-indigo-500 flex items-center gap-1">
              <Globe className="w-4 h-4" />
              Browse Public Notes
            </Link>
          </div>
          <div className="flex gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Note
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Note</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Title"
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  />
                  <Textarea
                    placeholder="Content"
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    className="min-h-[200px]"
                  />
                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-medium text-gray-700">Visibility</label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setNewNote({ ...newNote, is_public: false })}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md border ${
                          !newNote.is_public
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Lock className="w-4 h-4" />
                        Private
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewNote({ ...newNote, is_public: true })}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md border ${
                          newNote.is_public
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Globe className="w-4 h-4" />
                        Public
                      </button>
                    </div>
                  </div>
                  <Button
                    onClick={createNote}
                    disabled={!newNote.title || !newNote.content}
                    className="w-full"
                  >
                    Create Note
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <Card key={note.id} className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <h2 className="text-xl font-semibold">{note.title}</h2>
                  <div className="flex items-center space-x-2">
                    <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
                      note.is_public 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {note.is_public ? (
                        <>
                          <Globe className="w-3 h-3" />
                          Public
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3" />
                          Private
                        </>
                      )}
                    </span>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteNote(note.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-gray-600 whitespace-pre-wrap">{note.content}</p>
                <p className="text-sm text-gray-400">
                  {new Date(note.created_at).toLocaleDateString()}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}