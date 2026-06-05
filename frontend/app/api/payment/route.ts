import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId') || 'guest'

  const checkoutUrl = new URL('https://example.com/checkout')
  checkoutUrl.searchParams.set('plan', 'pro')
  checkoutUrl.searchParams.set('amount', '10')
  checkoutUrl.searchParams.set('userId', userId)

  return NextResponse.redirect(checkoutUrl)
}
