// app/feedback/page.js
import GuestLayout from '../guest/layout';

export default function FeedbackPage() {
  return (
    <GuestLayout>
      <div className="p-8">
        <h1 className="text-4xl font-bold text-textPrimary font-playfair mb-4">
          Feedback
        </h1>
        <p className="text-textSecondary">
          Share your experience with us...
        </p>
      </div>
    </GuestLayout>
  );
}