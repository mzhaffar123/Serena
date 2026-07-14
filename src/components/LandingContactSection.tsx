import type { LucideIcon } from "lucide-react";
import { Mail, MapPin, Phone } from "lucide-react";

type ContactItem = {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
};

const contactItems: ContactItem[] = [
  {
    icon: Mail,
    label: "Email dukungan",
    value: "support@serena.com",
    href: "mailto:support@serena.com",
  },
  {
    icon: Phone,
    label: "Waktu respons",
    value: "Senin - Jumat, 09.00 - 18.00 WIB",
  },
  {
    icon: MapPin,
    label: "Area layanan",
    value: "Konsultasi online untuk seluruh Indonesia",
  },
];

export default function LandingContactSection() {
  return (
    <section
      id="contact"
      className="scroll-mt-28 border-t border-serena-sage-100/60 bg-gradient-to-b from-serena-sage-50/70 via-serena-cream-50 to-white px-6 py-20 lg:px-16"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-start lg:gap-16">
          <div className="max-w-xl pt-3">
            <div className="inline-flex items-center rounded-full border border-serena-sage-100 bg-white/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-serena-sage-700 shadow-sm">
              Hubungi Serena
            </div>

            <h2 className="mt-6 font-rounded text-3xl font-bold tracking-tight text-indigo-950 sm:text-4xl">
              Hubungi Kami
            </h2>

            <p className="mt-4 max-w-lg text-sm leading-7 text-indigo-950/60 sm:text-base">
              Punya pertanyaan tentang platform kami, keamanan data, atau ingin bermitra sebagai
              konselor? Kirimkan pesan kepada kami dan tim Serena akan membantu Anda secepatnya.
            </p>

            <div className="mt-10 space-y-5">
              {contactItems.map((item) => {
                const Icon = item.icon;
                const content = (
                  <>
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-serena-sage-100 text-teal-700">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-950/35">
                        {item.label}
                      </p>
                      <p className="mt-1 text-sm font-medium leading-6 text-indigo-950/75 sm:text-base">
                        {item.value}
                      </p>
                    </div>
                  </>
                );

                if (item.href) {
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      className="group flex items-center gap-4 rounded-3xl border border-transparent px-1 py-1 transition hover:border-serena-sage-100/80 hover:bg-white/50"
                    >
                      {content}
                    </a>
                  );
                }

                return (
                  <div key={item.label} className="flex items-center gap-4 px-1 py-1">
                    {content}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-xl shadow-indigo-950/5 sm:p-8 lg:p-9">
            <form
              action="mailto:support@serena.com"
              method="post"
              encType="text/plain"
              className="space-y-6"
            >
              <div>
                <label htmlFor="contact-name" className="mb-2 block text-sm font-semibold text-indigo-950">
                  Nama
                </label>
                <input
                  id="contact-name"
                  name="Nama"
                  type="text"
                  required
                  className="w-full rounded-2xl border border-serena-sage-100 bg-serena-sage-50/60 px-4 py-3.5 text-sm text-indigo-950 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />
              </div>

              <div>
                <label htmlFor="contact-email" className="mb-2 block text-sm font-semibold text-indigo-950">
                  E-mail
                </label>
                <input
                  id="contact-email"
                  name="Email"
                  type="email"
                  required
                  className="w-full rounded-2xl border border-serena-sage-100 bg-serena-sage-50/60 px-4 py-3.5 text-sm text-indigo-950 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />
              </div>

              <div>
                <label htmlFor="contact-message" className="mb-2 block text-sm font-semibold text-indigo-950">
                  Pesan
                </label>
                <textarea
                  id="contact-message"
                  name="Pesan"
                  required
                  rows={5}
                  className="w-full resize-none rounded-2xl border border-serena-sage-100 bg-serena-sage-50/60 px-4 py-3.5 text-sm text-indigo-950 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-full bg-teal-600 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-teal-900/10 transition hover:bg-teal-700 active:scale-[0.99]"
              >
                Kirim Pesan
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
