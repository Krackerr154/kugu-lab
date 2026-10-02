"use client";

import { useEffect } from "react";
import { StudentIdentityProvider } from "@/components/shared/StudentIdentityProvider";
import { M3PresentationProvider, useM3Presentation } from "@/components/shared/M3PresentationProvider";
import { SlideDeckCanvas } from "@/components/presentation/SlideDeckCanvas";

function PresentationRunner() {
  const { role, activeSession, follow } = useM3Presentation();

  // Automatically follow live session if student is in solo mode
  useEffect(() => {
    if (activeSession && role === "solo") {
      follow(activeSession.roomId);
    }
  }, [activeSession, role, follow]);

  return <SlideDeckCanvas exitHref="/modules/m4-sn-bi-electrodeposition" />;
}

export default function PresentationPage() {
  return (
    <StudentIdentityProvider>
      <M3PresentationProvider>
        <PresentationRunner />
      </M3PresentationProvider>
    </StudentIdentityProvider>
  );
}
