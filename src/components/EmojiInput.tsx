import { useState } from "react";
import EmojiPicker, { Theme } from "emoji-picker-react";

import { Smile } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const EmojiInput = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (emoji: string) => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex items-center">
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="px-2 rounded-md hover:bg-muted transition"
            >
              {value ? (
                <span className="text-lg">{value}</span>
              ) : (
                <Smile className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          </TooltipTrigger>

          <TooltipContent side="top" className="text-sm">
            {value ? "Project emoji" : "Select an emoji"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {open && (
        <div className="absolute top-10 right-0 z-[9999] bg-background rounded-md shadow-lg border">
          <EmojiPicker
            onEmojiClick={(emojiData) => {
              onChange(emojiData.emoji);
              setOpen(false);
            }}
            height={250}
            width={300}
            skinTonesDisabled
            previewConfig={{ showPreview: false }}
            theme={Theme.DARK}
          />
        </div>
      )}
    </div>
  );
};

export default EmojiInput;
