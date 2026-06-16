import Link from 'next/link'
import Providers from './providers'

export const metadata = { title: 'Next Todo' }

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <h1>Todos (Next)</h1>
          <nav>
            <Link href="/">Home</Link>
          </nav>
          {children}
        </Providers>
      </body>
    </html>
  )
}
