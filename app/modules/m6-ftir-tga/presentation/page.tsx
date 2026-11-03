"use client";

import { useEffect } from "react";
import { StudentIdentityProvider } from "@/components/shared/StudentIdentityProvider";
import { M3PresentationProvider, useM3Presentation } from "@/components/shared/M3PresentationProvider";
import { M6SlideDeckCanvas } from "@/components/presentation/M6SlideDeckCanvas";

function PresentationRunner() {
  const { role, activeSession, follow } = useM3Presentation();

  // Join the live session automatically when a student lands here in solo mode.
  useEffect(() => {
    if (activeSession && role === "solo") {
      follow(activeSession.roomId);
    }
  }, [activeSession, role, follow]);

  return <M6SlideDeckCanvas exitHref="/modules/m6-ftir-tga" />;
}

export default function M6PresentationPage() {
  return (
    <StudentIdentityProvider>
      <M3PresentationProvider>
        <PresentationRunner />
      </M3PresentationProvider>
    </StudentIdentityProvider>
  );
}
