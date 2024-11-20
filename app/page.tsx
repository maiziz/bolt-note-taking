import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pen } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-block p-3 bg-indigo-100 rounded-full">
            <Pen className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Notes</h1>
          <p className="text-gray-500">Your personal space for thoughts and ideas</p>
        </div>
        
        <div className="space-y-4">
          <Link href="/signin">
            <Button className="w-full" size="lg">
              Sign In
            </Button>
          </Link>
          <p className="text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link href="/signup" className="text-indigo-600 hover:text-indigo-500">
              Sign up
            </Link>
          </p>
        </div>
      </Card>
    </main>
  );
}