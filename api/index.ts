import { route } from './_lib.js'

export default route(['GET'], async (_req, res) => {
  res.status(200).json({ status: 'ok', app: 'Boom Zapas API (Vercel)' })
})
