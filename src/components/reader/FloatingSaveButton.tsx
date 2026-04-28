interface FloatingSaveButtonProps {
  label: string;
  saved: boolean;
  onClick: () => void;
}

export function FloatingSaveButton({ label, saved, onClick }: FloatingSaveButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`fixed inset-x-4 bottom-5 z-50 flex h-14 items-center justify-center rounded-full px-6 text-sm font-semibold shadow-xl transition-all sm:hidden ${
        saved
          ? 'bg-green-600 text-white'
          : 'bg-blue-800 text-white hover:bg-blue-900 active:scale-95'
      }`}
    >
      {label}
    </button>
  );
}
