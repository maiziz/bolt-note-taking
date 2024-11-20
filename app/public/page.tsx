"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Book, Eye, Globe, Mail, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface PublicNote {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
  user_email: string;
}

export default function PublicNotesPage() {
  const [notes, setNotes] = useState<PublicNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNote, setSelectedNote] = useState<PublicNote | null>(null);

  useEffect(() => {
    fetchPublicNotes();
  }, []);

  const fetchPublicNotes = async () => {
    try {
      setLoading(true);
      console.log("Fetching public notes...");
      
      // First, verify the Supabase connection
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Current session:", session ? "Authenticated" : "Not authenticated");

      // Fetch public notes with simplified query first
      const { data: notesData, error: notesError } = await supabase
        .from("notes")
        .select("*")
        .eq("is_public", true);

      if (notesError) {
        console.error("Database error:", notesError);
        toast.error("Error loading notes: " + notesError.message);
        return;
      }

      console.log("Initial notes data:", notesData);

      if (!notesData || notesData.length === 0) {
        console.log("No public notes found in database");
        setNotes([]);
        return;
      }

      // Now fetch user details for each note
      const notesWithUsers = await Promise.all(
        notesData.map(async (note) => {
          if (!note.user_id) {
            return { ...note, user_email: "Anonymous" };
          }

          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("email")
            .eq("id", note.user_id)
            .single();

          if (userError) {
            console.warn("Could not fetch user for note:", note.id, userError);
            return { ...note, user_email: "Anonymous" };
          }

          return {
            ...note,
            user_email: userData?.email || "Anonymous"
          };
        })
      );

      console.log("Notes with user data:", notesWithUsers);
      setNotes(notesWithUsers);
    } catch (error) {
      console.error("Error in fetchPublicNotes:", error);
      toast.error("Failed to load public notes. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <Link href="/notes" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Notes
          </Link>
        </div>
        <div className="text-center py-8">
          Loading public notes...
        </div>
      </div>
    );
  }

  if (!loading && (!notes || notes.length === 0)) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <Link href="/notes" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Notes
          </Link>
        </div>
        <div className="text-center py-8">
          <Globe className="mx-auto w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Public Notes Yet</h3>
          <p className="text-gray-500">
            Be the first to share a public note with the community!
          </p>
          <Link href="/notes">
            <Button className="mt-4">
              Create a Note
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Hero Section */}
      <div className="bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Globe className="w-6 h-6 text-indigo-600" />
                Public Notes
              </h1>
              <p className="text-gray-600 mt-1">Discover and learn from the community's shared knowledge</p>
            </div>
            <Link 
              href="/notes" 
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              My Notes
            </Link>
          </div>

          {/* Search Bar */}
          <div className="mt-6 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search public notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full bg-white/50 backdrop-blur-sm focus:bg-white transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {filteredNotes.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No matching notes found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search terms</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <Card 
              key={note.id} 
              className="group hover:shadow-lg transition-shadow duration-200 flex flex-col overflow-hidden bg-white/70 backdrop-blur-sm hover:bg-white"
            >
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {note.title}
                  </h3>
                  <Book className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                </div>
                <p className="mt-2 text-gray-600 line-clamp-3">
                  {note.content}
                </p>
              </div>

              <div className="px-6 py-4 bg-gray-50/50 border-t flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="truncate max-w-[200px]">{note.user_email}</span>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-2 hover:bg-indigo-50"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Read
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-semibold text-gray-900">
                        {note.title}
                      </DialogTitle>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                        <Mail className="w-4 h-4" />
                        {note.user_email}
                        <span className="mx-2">•</span>
                        <time dateTime={note.created_at}>
                          {new Date(note.created_at).toLocaleDateString()}
                        </time>
                      </div>
                    </DialogHeader>
                    <div className="mt-6 prose prose-indigo max-w-none">
                      <div className="bg-gray-50/50 p-6 rounded-lg border">
                        <div className="whitespace-pre-wrap text-gray-700">
                          {note.content}
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          Close
                        </Button>
                      </DialogTrigger>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
