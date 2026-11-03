"use client";

import { useEffect } from "react";
import { StudentIdentityProvider } from "@/components/shared/StudentIdentityProvider";
import { M3PresentationProvider, useM3Presentation } from "@/components/shared/M3PresentationProvider";
import { M7SlideDeckCanvas } from "@/components/presentation/M7SlideDeckCanvas";

function PresentationRunner() {
  const { role, activeSession, follow } = useM3Presentation();

  // Join the live session automatically when a student lands here in solo mode.
  useEffect(() => {
    if (activeSession && role === "solo") {
      follow(activeSession.roomId);
    }
  }, [activeSession, role, follow]);

  return <M7SlideDeckCanvas exitHref="/modules/m7-bet" />;
}

export default function M7PresentationPage() {
  return (
    <StudentIdentityProvider>
      <M3PresentationProvider>
        <PresentationRunner />
      </M3PresentationProvider>
    </StudentIdentityProvider>
  );
}
