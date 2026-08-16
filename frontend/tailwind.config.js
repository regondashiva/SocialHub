/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#000000',
        'ig-black': '#000000',
        'ig-dark': '#121212',
        'ig-elevated': '#1C1C1E',
        'ig-border': '#262626',
        'ig-hover': '#1A1A1A',
        'ig-blue': '#0095F6',
        'ig-blue-hover': '#1877F2',
        'ig-red': '#ED4956',
        'ig-secondary': '#A8A8A8',
        primary: '#000000',
        secondary: '#121212',
        accent: '#0095F6',
      },
      backgroundImage: {
        'ig-gradient': 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
        'ig-gradient-story': 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)',
        'neon-gradient': 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
      },
      maxWidth: {
        'ig-feed': '470px',
        'ig-reel': '420px',
      }
    },
  },
  plugins: [],
}


