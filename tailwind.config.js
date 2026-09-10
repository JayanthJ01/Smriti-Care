/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FFFEF7',
          100: '#FFFBEF',
          200: '#FFF3D9',
          300: '#F6E3B8',
        },
        ink: {
          900: '#12372A',
          700: '#2E443D',
          600: '#4A5E58',
          500: '#6E857D',
        },
        pine: {
          950: '#0B3B2A',
          900: '#114E36',
          800: '#1B6B4A',
          700: '#1E7E56',
          600: '#249367',
          500: '#2FA97A',
          100: '#D5EBDD',
          50: '#EAF6ED',
        },
        marigold: {
          700: '#9A5B00',
          600: '#C67A0A',
          500: '#E8930C',
          400: '#F2A413',
          300: '#F9BE4A',
          200: '#FBD98B',
          100: '#FDE9BE',
          50: '#FFF4D9',
        },
        leaf: {
          700: '#2F6B2E',
          600: '#3E8340',
          500: '#57A35A',
          100: '#DDEBDD',
          50: '#EFF6EF',
        },
        clay: {
          600: '#B94A2E',
          500: '#D05A3A',
          100: '#F9DACA',
          50: '#FFF0E6',
        },
        // --- Reference 2 pastel surfaces (centralized, reuse only) ---
        sky: {
          50: '#F0F8FE',
          100: '#E3F1FD',
          200: '#C7E2FA',
          500: '#2E9BDA',
          600: '#1E7FA6',
          700: '#0F5D7C',
        },
        peach: {
          50: '#FFF6EF',
          100: '#FFEEDF',
          200: '#FFD9B8',
        },
        mint: {
          50: '#EFF8F0',
          100: '#DFF0E1',
          200: '#BFE3C6',
        },
        lav: {
          50: '#F2EEFE',
          100: '#E3D9FB',
          200: '#C9B6F3',
          600: '#6D4FC2',
          700: '#5740A6',
        },
        sun: {
          50: '#FFFEF3',
          100: '#FFF5C9',
          200: '#FFE98A',
          400: '#FFD84D',
        },
        coral: {
          50: '#FFEDEA',
          100: '#FFD5CE',
          500: '#E85D4D',
          600: '#D14A3B',
        },
        line: '#E7DCC0',
        mist: '#EDF1EC',
      },
      fontFamily: {
        display: ['Fraunces', '"Noto Sans Bengali"', 'Georgia', 'serif'],
        body: ['Nunito', '"Noto Sans Bengali"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 10px 30px -12px rgba(60, 45, 20, 0.22), 0 2px 6px rgba(60,45,20,0.08)',
        'card-lg': '0 18px 44px -16px rgba(60, 45, 20, 0.28), 0 3px 10px rgba(60,45,20,0.08)',
        button: '0 6px 16px -6px rgba(20, 80, 70, 0.45)',
        'button-amber': '0 8px 20px -6px rgba(200, 120, 10, 0.55)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      },
      minHeight: {
        touch: '3.5rem',
        'touch-lg': '4.25rem',
      },
      minWidth: {
        touch: '3.5rem',
      },
    },
  },
  plugins: [],
};
