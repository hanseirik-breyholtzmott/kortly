"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

export function EnvCheck() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const checks = [
    {
      name: "Supabase URL",
      value: supabaseUrl,
      isValid: !!supabaseUrl && supabaseUrl.startsWith("https://"),
      description:
        "Should start with https:// and be your Supabase project URL",
    },
    {
      name: "Supabase Anon Key",
      value: supabaseKey,
      isValid: !!supabaseKey && supabaseKey.length > 50,
      description: "Should be a long string starting with 'eyJ'",
    },
    {
      name: "Environment File",
      value: "Check .env.local exists",
      isValid: !!(supabaseUrl && supabaseKey),
      description: "Make sure .env.local file exists in project root",
    },
  ];

  const allValid = checks.every((check) => check.isValid);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {allValid ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-yellow-500" />
          )}
          Environment Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {checks.map((check, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {check.isValid ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="font-medium">{check.name}</span>
              </div>
              <p className="text-sm text-gray-600">{check.description}</p>
              {check.value && (
                <p className="text-xs text-gray-500 mt-1 font-mono">
                  {check.name === "Supabase Anon Key"
                    ? `${check.value.substring(0, 20)}...`
                    : check.value}
                </p>
              )}
            </div>
            <Badge variant={check.isValid ? "default" : "destructive"}>
              {check.isValid ? "Valid" : "Invalid"}
            </Badge>
          </div>
        ))}

        {!allValid && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-medium text-red-800 mb-2">Setup Required</h4>
            <ol className="text-sm text-red-700 space-y-1 list-decimal list-inside">
              <li>
                Create a{" "}
                <code className="bg-red-100 px-1 rounded">.env.local</code> file
                in your project root
              </li>
              <li>Add your Supabase URL and Anon Key</li>
              <li>Restart your development server</li>
              <li>Run the database setup SQL in Supabase</li>
            </ol>
          </div>
        )}

        {allValid && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">
              ✅ Environment Ready
            </h4>
            <p className="text-sm text-green-700">
              Your environment is properly configured. You can now test the
              Supabase connection.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
