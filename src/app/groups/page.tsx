"use client";

import { GroupStagePicker } from "@/components/groups/GroupStagePicker";
import { BracketFormatExplainer } from "@/components/bracket/BracketFormatExplainer";

export default function GroupsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Group Stage</h1>
        <p className="mt-1 text-gray-500">
          Final standings, finish probabilities, and live bracket impact when 3rd-place teams change
        </p>
      </div>
      <BracketFormatExplainer />
      <GroupStagePicker />
    </div>
  );
}
