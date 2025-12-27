import './globals.css'

export const metadata = {
  title: 'Warmly - Privacy-First Translation',
  description: 'Real-time translation for cross-cultural couples and families',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
