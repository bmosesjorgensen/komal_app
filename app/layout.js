import './globals.css'

export const metadata = {
  title: 'Komal Translation - Soft, Sweet, Tempered',
  description: 'Privacy-first translation app for cross-cultural love',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
