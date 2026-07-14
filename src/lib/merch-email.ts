// src/lib/merch-email.ts
// Sends merch order confirmation emails via Resend.
// Called from the Stripe webhook after payment confirmed — always sends,
// regardless of whether the Printify order creation succeeded, so the
// customer isn't left wondering and James isn't left finding out by accident.

import { Resend } from "resend"

function getResend() { return new Resend(process.env.RESEND_API_KEY) }

export interface MerchOrderItem {
  name:        string
  variantName: string
  quantity:    number
  price:       number  // dollars, per unit
}

export interface MerchOrderPayload {
  id:               string   // our merch_orders.id
  customerName:     string
  customerEmail:    string
  shippingAddress:  { line1: string; line2?: string; city: string; region: string; zip: string; country: string }
  items:            MerchOrderItem[]
  totalPaid:        number   // cents
  discountCode:     string
  printifyOrderId:  string | null
  printifyError:    string | null
}

function formatAddress(a: MerchOrderPayload["shippingAddress"]) {
  return [a.line1, a.line2, `${a.city}, ${a.region} ${a.zip}`, a.country].filter(Boolean).join("<br>")
}

function itemsTable(items: MerchOrderItem[]) {
  return items.map(i => `
    <tr>
      <td style="padding:8px 0;color:#1a1a1a">${i.name}${i.variantName ? ` — ${i.variantName}` : ""}</td>
      <td style="padding:8px 0;color:#666;text-align:center">×${i.quantity}</td>
      <td style="padding:8px 0;color:#1a1a1a;text-align:right">$${(i.price * i.quantity).toFixed(2)}</td>
    </tr>
  `).join("")
}

export async function sendMerchOrderEmails(order: MerchOrderPayload) {
  const totalFmt = `$${(order.totalPaid / 100).toFixed(2)}`
  const failed = !order.printifyOrderId

  const clientHtml = `
    <div style="font-family:sans-serif;color:#1a1a1a;max-width:520px">
      <h2 style="color:#D4AF77">Order Confirmed</h2>
      <p>Hi ${order.customerName}, thanks for your order from Mid City Sound Studios.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        ${itemsTable(order.items)}
        <tr><td colspan="2" style="padding:12px 0 0;color:#666;font-weight:bold">Total</td>
            <td style="padding:12px 0 0;text-align:right;font-weight:bold">${totalFmt}</td></tr>
      </table>
      <p style="color:#666;font-size:13px">Shipping to:<br>${formatAddress(order.shippingAddress)}</p>
      <p style="color:#666;font-size:13px">Ships from New Orleans via Printify. You'll get a separate email with
      tracking once it's in production.</p>
      <p style="color:#999;font-size:12px">Order ${order.id} · Questions? Reply to this email or contact us at
      midcitysound1@gmail.com</p>
    </div>
  `

  const studioHtml = `
    <div style="font-family:sans-serif;color:#1a1a1a;max-width:520px">
      <h2 style="color:${failed ? '#c0392b' : '#D4AF77'}">
        ${failed ? '⚠ Merch Order — Printify Submission FAILED' : 'New Merch Order'}
      </h2>
      ${failed ? `
        <p style="background:#fdecea;border:1px solid #c0392b;padding:10px;color:#c0392b;font-size:13px">
          Payment succeeded but the Printify order was NOT created automatically.
          Manual action needed — create this order in Printify directly.<br>
          Error: ${order.printifyError ?? 'unknown'}
        </p>
      ` : `
        <p style="color:#2e7d32;font-size:13px">Printify order created: <strong>${order.printifyOrderId}</strong></p>
      `}
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:8px 0;color:#666;width:140px">Customer</td><td><strong>${order.customerName}</strong></td></tr>
        <tr><td style="padding:8px 0;color:#666">Email</td><td><a href="mailto:${order.customerEmail}">${order.customerEmail}</a></td></tr>
        <tr><td style="padding:8px 0;color:#666">Shipping</td><td>${formatAddress(order.shippingAddress)}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Total Paid</td><td><strong>${totalFmt}</strong></td></tr>
        ${order.discountCode ? `<tr><td style="padding:8px 0;color:#666">Discount</td><td>${order.discountCode}</td></tr>` : ""}
        <tr><td style="padding:8px 0;color:#666">Order ID</td><td style="font-family:monospace;font-size:12px">${order.id}</td></tr>
      </table>
      <table style="width:100%;border-collapse:collapse">${itemsTable(order.items)}</table>
      <p style="color:#999;font-size:12px">View in <a href="/admin/orders">the admin orders page</a>.</p>
    </div>
  `

  await getResend().emails.send({
    from:    process.env.RESEND_FROM_EMAIL ?? "studio@midcitysound.com",
    to:      order.customerEmail,
    subject: `Order Confirmed — Mid City Sound Studios · ${order.id.slice(0, 8)}`,
    html:    clientHtml,
  })

  await getResend().emails.send({
    from:    process.env.RESEND_FROM_EMAIL ?? "studio@midcitysound.com",
    to:      process.env.RESEND_TO_EMAIL   ?? "midcitysound1@gmail.com",
    subject: `${failed ? '[ACTION NEEDED] ' : ''}[MCS Merch] ${order.customerName} · ${totalFmt}`,
    html:    studioHtml,
  })
}
