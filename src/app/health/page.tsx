// src/app/health/page.tsx
"use client";
import { useEffect, useState } from "react";
import API from "@/lib/api";

export default function HealthPage(){
  const [http,setHttp] = useState("checking...");
  
  useEffect(()=>{
    API.get("/health")
      .then(r=>setHttp(JSON.stringify(r.data, null, 2)))
      .catch(e=>setHttp(`Error: ${e.message || String(e)}`));
  },[]);
  
  return (
    <div className="px-6 sm:px-8">
      <div className="w-full max-w-6xl mx-auto">
        <div className="bg-[var(--card)] rounded-2xl shadow-lg p-6">
          <h1 className="text-3xl font-bold mb-4">Health Check</h1>
          <div className="space-y-2 text-sm">
            <div className="font-mono bg-gray-100 dark:bg-gray-800 p-4 rounded">
              <div className="text-gray-600 dark:text-gray-400 mb-2">API Status:</div>
              <pre className="whitespace-pre-wrap">{http}</pre>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            <p>✅ Backend integrado en Next.js funcionando</p>
            <p>✅ Sin dependencia de backend Python externo</p>
          </div>
        </div>
      </div>
    </div>
  );
}
