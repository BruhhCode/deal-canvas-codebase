import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Clock, Handshake } from "lucide-react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us | DealsCanvas" },
      {
        name: "description",
        content: "Get in touch with the DealsCanvas team — questions, partnership enquiries, or feedback on a deal.",
      },
      { property: "og:title", content: "Contact Us | DealsCanvas" },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

const topics = ["General question", "Report a broken deal or link", "Brand / partnership enquiry", "Press"] as const;

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState<(typeof topics)[number]>(topics[0]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      toast.error("Contact form isn't available right now.");
      return;
    }
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Fill in your name, email and message before sending.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: name.trim(),
      email: email.trim(),
      subject,
      message: message.trim(),
    });
    setSubmitting(false);
    if (error) {
      toast.error(`Couldn't send your message: ${error.message}`);
      return;
    }
    setSent(true);
    setName("");
    setEmail("");
    setSubject(topics[0]);
    setMessage("");
    toast.success("Message sent — we'll get back to you soon.");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Contact Us" }]} />

      <header className="mb-10 border-b pb-6">
        <p className="editorial-eyebrow">Get in touch</p>
        <h1 className="mt-3 text-4xl md:text-5xl">Contact Us</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Questions about a deal, a partnership enquiry, or something not working right — send us a message and
          we'll get back to you.
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <div className="flex flex-col justify-between gap-6">
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 text-clay" />
              <div>
                <p className="text-sm font-semibold">Response time</p>
                <p className="text-sm text-muted-foreground">Usually within 1–2 business days.</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-start gap-3">
              <MessageCircle className="mt-0.5 h-5 w-5 text-clay" />
              <div>
                <p className="text-sm font-semibold">Found a broken deal?</p>
                <p className="text-sm text-muted-foreground">
                  Pick "Report a broken deal or link" below and include the product or deal name — it helps us fix
                  it faster.
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-start gap-3">
              <Handshake className="mt-0.5 h-5 w-5 text-clay" />
              <div>
                <p className="text-sm font-semibold">Partnerships & press</p>
                <p className="text-sm text-muted-foreground">
                  Brand collaborations, affiliate partnerships or press requests — pick "Brand / partnership
                  enquiry" or "Press" below and tell us what you have in mind.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          {sent ? (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <p className="text-lg font-semibold">Thanks — your message is on its way.</p>
              <p className="mt-2 text-sm text-muted-foreground">We'll reply to the email address you gave us.</p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="mt-6 rounded-sm border px-5 py-2 text-sm font-semibold uppercase tracking-wider hover:border-clay"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className="editorial-eyebrow mb-2 block">
                    Name
                  </label>
                  <input
                    id="contact-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={100}
                    required
                    className="w-full rounded-sm border bg-background px-3 py-2 text-sm outline-none focus:border-clay"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="editorial-eyebrow mb-2 block">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    maxLength={200}
                    required
                    className="w-full rounded-sm border bg-background px-3 py-2 text-sm outline-none focus:border-clay"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="contact-subject" className="editorial-eyebrow mb-2 block">
                  Topic
                </label>
                <select
                  id="contact-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value as (typeof topics)[number])}
                  className="w-full rounded-sm border bg-background px-3 py-2 text-sm outline-none focus:border-clay"
                >
                  {topics.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="contact-message" className="editorial-eyebrow mb-2 block">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  maxLength={4000}
                  required
                  placeholder="How can we help?"
                  className="w-full rounded-sm border bg-background px-3 py-2 text-sm outline-none focus:border-clay"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-sm bg-primary px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-clay hover:text-clay-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {submitting ? "Sending…" : "Send message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
