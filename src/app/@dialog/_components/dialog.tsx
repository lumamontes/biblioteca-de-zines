"use client";

import { PropsWithChildren } from "react";

export function Dialog({ children }: PropsWithChildren) {
  return (
    <dialog className="absolute top-0 w-full h-full bg-gray-600 bg-opacity-75 flex justify-center items-center">
      {children}
    </dialog>
  );
}
