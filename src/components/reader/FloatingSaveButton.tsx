interface FloatingSaveButtonProps {
  label: string;
  saved: boolean;
  mode: 'chumash' | 'rashi';
  onClick: () => void;
}

export function FloatingSaveButton({ label, saved, mode, onClick }: FloatingSaveButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`fixed inset-x-4 bottom-5 z-50 flex h-14 items-center justify-center rounded-full px-6 text-sm font-semibold shadow-xl transition-all sm:hidden active:scale-95 ${
        saved
          ? 'bg-green-600 text-white'
          : mode === 'rashi'
          ? 'bg-amber-600 text-white hover:bg-amber-700'
          : 'bg-blue-800 text-white hover:bg-blue-900'
      }`}
    >
      {label}
    </button>
  );
}
