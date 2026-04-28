interface FloatingSaveButtonProps {
  label: string;
  saved: boolean;
  mode: 'chumash' | 'rashi';
  onClick: () => void;
}

export function FloatingSaveButton({ label, saved, mode, onClick }: FloatingSaveButtonProps) {
  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={onClick}
        className={`fixed inset-x-4 bottom-8 z-50 flex h-14 w-[calc(100vw-2rem)] items-center justify-center rounded-full text-sm font-semibold shadow-xl transition-all active:scale-95 ${
          saved
            ? 'bg-green-600 text-white'
            : mode === 'rashi'
            ? 'bg-amber-600 text-white'
            : 'bg-blue-800 text-white'
        }`}
      >
        {label}
      </button>
    </div>
  );
}
