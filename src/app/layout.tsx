import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LectuNote AI — Asisten Belajar & Evaluasi Materi Kuliah",
  description:
    "Ubah slide kuliah, rekaman suara dosen, dan catatan menjadi Study Kit komprehensif: ringkasan terstruktur, flashcard interaktif active recall, serta simulasi kuis ujian otomatis berbasis AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} font-sans`} suppressHydrationWarning>
      <head>
        {/* Anti-Extension Hydration Mismatch: Hapus atribut yang diinjeksi ekstensi browser (misal Bitwarden bis_skin_checked) sebelum hidrasi React */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var clean = function(el) {
                    if (el && el.removeAttribute && el.hasAttribute('bis_skin_checked')) {
                      el.removeAttribute('bis_skin_checked');
                    }
                  };
                  var observer = new MutationObserver(function(mutations) {
                    for (var i = 0; i < mutations.length; i++) {
                      var m = mutations[i];
                      if (m.type === 'attributes' && m.attributeName === 'bis_skin_checked') {
                        clean(m.target);
                      } else if (m.type === 'childList') {
                        for (var j = 0; j < m.addedNodes.length; j++) {
                          var node = m.addedNodes[j];
                          if (node && node.nodeType === 1) {
                            clean(node);
                            var descendants = node.querySelectorAll ? node.querySelectorAll('[bis_skin_checked]') : [];
                            for (var k = 0; k < descendants.length; k++) {
                              clean(descendants[k]);
                            }
                          }
                        }
                      }
                    }
                  });
                  observer.observe(document.documentElement, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeFilter: ['bis_skin_checked']
                  });
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen bg-background text-text-main" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
