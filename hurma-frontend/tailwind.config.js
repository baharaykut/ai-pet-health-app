/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // 🌈 Marka Teması (colors.ts ile birebir)
        primary: "#FF8A00",       // turuncu patik rengi
        primarySoft: "#FFE5C2",   // açık turuncu ton
        background: "#F5F7FB",    // arka plan gri-mavi ton
        card: "#FFFFFF",          // kart beyazı
        text: "#222B45",          // koyu metin
        muted: "#8F9BB3",         // gri metin
        border: "#E4E9F2",        // sınır rengi
        success: "#4CD964",       // yeşil (başarılı)
        danger: "#FF3B30",        // kırmızı (hata)

        // 🎨 Ek yardımcı tonlar (UI için)
        brand: "#FF914D",
        softGray: "#F6F6F6",
        darkGray: "#444B59",
        softBlue: "#DDE6ED",
      },
      fontFamily: {
        sans: ["Inter", "System UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};
