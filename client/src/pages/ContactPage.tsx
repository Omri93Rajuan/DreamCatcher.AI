import React, { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-[70vh] bg-gradient-to-br from-white via-white to-amber-50 px-4 py-16 dark:from-[#0f0f14] dark:via-[#0f0f14] dark:to-[#1e1b2f]">
      <div className="mx-auto max-w-3xl rounded-3xl border border-amber-200/60 bg-white/90 p-8 shadow-xl backdrop-blur dark:border-white/10 dark:bg-white/5">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">צור קשר</h1>
        <p className="mt-2 text-slate-600 dark:text-white/70">
          יש לכם רעיון לשיפור, תקלה או שאלה? השאירו פרטים ואחזור אליכם בהקדם.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6" dir="rtl">
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700 dark:text-white/80">
              שם מלא
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 dark:border-white/15 dark:bg-white/10 dark:text-white"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700 dark:text-white/80">
              אימייל לחזרה
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 dark:border-white/15 dark:bg-white/10 dark:text-white"
              />
            </label>
          </div>

          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700 dark:text-white/80">
            הודעה
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={6}
              required
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200 dark:border-white/15 dark:bg-white/10 dark:text-white"
            />
          </label>

          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-amber-300"
          >
            שלחו הודעה
          </button>
        </form>

        {sent && (
          <div className="mt-6 rounded-2xl border border-green-300 bg-green-50 px-4 py-3 text-slate-700 dark:border-green-500/40 dark:bg-green-500/10 dark:text-green-100">
            תודה! ההודעה נשלחה, ונחזור אליכם בקרוב.
          </div>
        )}
      </div>
    </div>
  );
}
