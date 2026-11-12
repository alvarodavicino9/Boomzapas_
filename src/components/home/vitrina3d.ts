/**
 * Escena 3D de la portada ("Vitrina 360°"): las zapatillas recortadas giran en un anillo sobre un aro de neón,
 * con reflejo en el piso, sombra, polvo flotante y un brillo que barre el par del frente.
 *
 * Rendimiento:
 *  - Se carga aparte (import dinámico desde Hero3D), después de que la portada ya se ve: three.js no frena la primera carga.
 *  - Sólo dibuja cuando la portada está en pantalla y la pestaña abierta.
 *  - Ajusta la calidad al equipo: menos resolución y menos partículas en celulares o compus con poca memoria,
 *    y si igual va lento (menos de ~40 cuadros por segundo) baja un escalón más solo.
 *  - Al salir del inicio libera todo (texturas, geometrías y el contexto WebGL).
 */
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  Raycaster,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  Vector2,
  WebGLRenderer,
} from 'three'

export interface VitrinaOpciones {
  imagenes: string[]
  /** Se llama cada vez que cambia el par que queda al frente. */
  onFrente: (i: number) => void
  /** Tocaron el par que ya estaba al frente. */
  onElegir: (i: number) => void
  /** Avance del giro automático (0 a 1), para la barrita de la tarjeta. */
  onProgreso?: (p: number) => void
  /** La escena terminó de cargar y ya dibujó. */
  onListo?: () => void
}

export interface Vitrina {
  ir: (delta: number) => void
  pausar: (si: boolean) => void
  destruir: () => void
}

const AUTO_S = 4.2 // segundos entre giro y giro
const ESPERA_S = 6 // después de que alguien toca, cuánto espera para volver a girar solo

/* ── texturas dibujadas en un canvas ── */
function canvasTex(size: number, draw: (g: CanvasRenderingContext2D, s: number) => void) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  draw(c.getContext('2d')!, size)
  const t = new CanvasTexture(c)
  t.colorSpace = SRGBColorSpace
  return t
}
const radial = (stops: [number, string][]) =>
  canvasTex(256, (g, s) => {
    const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
    stops.forEach(([o, c]) => gr.addColorStop(o, c))
    g.fillStyle = gr
    g.fillRect(0, 0, s, s)
  })

/** Aro del piso: neón rojo, línea punteada y el texto del logo girando alrededor. */
const aroTex = () =>
  canvasTex(1024, (g, s) => {
    g.translate(s / 2, s / 2)
    g.strokeStyle = '#ff3b46'
    g.shadowColor = '#d92c37'
    g.shadowBlur = 40
    g.lineWidth = 5
    g.beginPath()
    g.arc(0, 0, s * 0.42, 0, Math.PI * 2)
    g.stroke()
    g.shadowBlur = 0
    g.lineWidth = 1
    g.strokeStyle = 'rgba(255,255,255,0.14)'
    g.beginPath()
    g.arc(0, 0, s * 0.475, 0, Math.PI * 2)
    g.stroke()
    // texto en círculo, como el sello del logo
    const texto = 'BOOM ZAPAS  •  SHOES SHOP  •  SINCE 2024  •  CÓRDOBA  •  '.repeat(2)
    g.font = '600 22px "Lexend Variable", Lexend, system-ui, sans-serif'
    g.fillStyle = 'rgba(255,120,128,0.55)'
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    const r = s * 0.355
    const paso = (Math.PI * 2) / texto.length
    for (let i = 0; i < texto.length; i++) {
      // de frente las letras se leen derechas (la parte de abajo del canvas queda cerca de la cámara)
      const th = i * paso
      g.save()
      g.translate(Math.sin(th) * r, Math.cos(th) * r)
      g.rotate(-th)
      g.fillText(texto[i], 0, 0)
      g.restore()
    }
    g.setLineDash([6, 18])
    g.lineWidth = 2
    g.strokeStyle = 'rgba(255,90,100,0.45)'
    g.beginPath()
    g.arc(0, 0, s * 0.3, 0, Math.PI * 2)
    g.stroke()
  })

/** Material de cada par: oscurece los de atrás, hace el reflejo con degradé y pasa un brillo diagonal. */
function materialPar(map: Texture, reflejo = false) {
  return new ShaderMaterial({
    uniforms: {
      map: { value: map },
      uBrillo: { value: 1 },
      uOpacidad: { value: 1 },
      uReflejo: { value: reflejo ? 1 : 0 },
      uBarrido: { value: -1 },
    },
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D map; uniform float uBrillo, uOpacidad, uReflejo, uBarrido; varying vec2 vUv;
      void main() {
        vec4 c = texture2D(map, vUv);
        float a = c.a * uOpacidad;
        if (uReflejo > 0.5) a *= pow(1.0 - vUv.y, 3.2);
        if (a < 0.004) discard;
        vec3 col = c.rgb * uBrillo;
        // franja de luz que cruza el par en diagonal
        float d = (vUv.x + vUv.y * 0.6) - uBarrido;
        col += vec3(1.0, 0.92, 0.92) * smoothstep(0.09, 0.0, abs(d)) * 0.38 * c.a;
        gl_FragColor = vec4(col, a);
        #include <colorspace_fragment>
      }`,
  })
}

export async function crearVitrina(contenedor: HTMLElement, opciones: VitrinaOpciones): Promise<Vitrina> {
  const { imagenes, onFrente, onElegir, onProgreso, onListo } = opciones
  const N = imagenes.length
  const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // calidad según el equipo
  const nav = navigator as Navigator & { deviceMemory?: number }
  const modesto = (nav.hardwareConcurrency || 8) <= 4 || (nav.deviceMemory || 8) <= 4
  const dpr = window.devicePixelRatio || 1
  const celu = !window.matchMedia('(min-width: 1024px)').matches
  let topePixeles = modesto ? 1.25 : celu ? 1.5 : 1.75

  const loader = new TextureLoader()
  const texturas = await Promise.all(
    imagenes.map(
      (src) =>
        new Promise<Texture>((ok, ko) =>
          loader.load(
            src,
            (t) => {
              t.colorSpace = SRGBColorSpace
              t.anisotropy = 4
              ok(t)
            },
            undefined,
            ko,
          ),
        ),
    ),
  )

  // el canvas lo crea la escena (y lo saca al destruirse): así nunca hay dos contextos WebGL sobre el mismo canvas
  const canvas = document.createElement('canvas')
  canvas.setAttribute('aria-hidden', 'true')
  canvas.className = 'absolute inset-0 block size-full'
  // en pantallas de mucha densidad el suavizado casi no se nota y cuesta caro
  const renderer = new WebGLRenderer({ canvas, antialias: dpr < 2 && !modesto, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(dpr, topePixeles))
  renderer.setClearColor(0x000000, 0)
  contenedor.appendChild(canvas)

  const escena = new Scene()
  const camara = new PerspectiveCamera(32, 1, 0.1, 100)
  const escenario = new Group()
  escena.add(escenario)
  const anillo = new Group()
  escenario.add(anillo)
  const R = 2.75
  const PISO = -1.05
  const H = 1.55
  const PASO = (Math.PI * 2) / N

  const texSombra = radial([[0, 'rgba(0,0,0,0.85)'], [0.45, 'rgba(0,0,0,0.45)'], [1, 'rgba(0,0,0,0)']])
  const texLuz = radial([[0, 'rgba(217,44,55,0.55)'], [0.35, 'rgba(150,12,20,0.28)'], [1, 'rgba(150,12,20,0)']])
  const texPunto = radial([[0, 'rgba(255,255,255,1)'], [0.3, 'rgba(255,255,255,0.6)'], [1, 'rgba(255,255,255,0)']])
  const texAro = aroTex()

  const luz = new Mesh(new PlaneGeometry(13, 13), new MeshBasicMaterial({ map: texLuz, transparent: true, depthWrite: false, blending: AdditiveBlending }))
  luz.rotation.x = -Math.PI / 2
  luz.position.y = PISO - 0.01
  escenario.add(luz)
  const ladoAro = (R * 2) / 0.84
  const aro = new Mesh(new PlaneGeometry(ladoAro, ladoAro), new MeshBasicMaterial({ map: texAro, transparent: true, depthWrite: false, blending: AdditiveBlending, opacity: 0.9 }))
  aro.rotation.x = -Math.PI / 2
  aro.position.y = PISO
  escenario.add(aro)

  const pares = texturas.map((tex, i) => {
    const img = tex.image as HTMLImageElement
    const geo = new PlaneGeometry((H * img.width) / img.height, H)
    const par = new Mesh(geo, materialPar(tex))
    const reflejo = new Mesh(geo, materialPar(tex, true))
    reflejo.scale.y = -1
    const sombra = new Mesh(
      new PlaneGeometry(((H * img.width) / img.height) * 0.95, H * 0.42),
      new MeshBasicMaterial({ map: texSombra, transparent: true, depthWrite: false }),
    )
    sombra.rotation.x = -Math.PI / 2
    sombra.position.y = 0.004
    const pivote = new Group()
    pivote.add(sombra, reflejo, par)
    const soporte = new Group()
    soporte.add(pivote)
    anillo.add(soporte)
    par.userData.indice = i
    return { soporte, pivote, par, reflejo, sombra, a: i * PASO, fase: Math.random() * 6.28 }
  })

  // polvo rojo que sube despacio
  const P = modesto ? 80 : celu ? 140 : 220
  const pos = new Float32Array(P * 3)
  const vel = new Float32Array(P)
  for (let i = 0; i < P; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 13
    pos[i * 3 + 1] = PISO + Math.random() * 4.5
    pos[i * 3 + 2] = (Math.random() - 0.5) * 9
    vel[i] = 0.05 + Math.random() * 0.18
  }
  const polvoGeo = new BufferGeometry()
  polvoGeo.setAttribute('position', new BufferAttribute(pos, 3))
  const polvo = new Points(
    polvoGeo,
    new PointsMaterial({ size: 0.055, map: texPunto, color: 0xff5a63, transparent: true, opacity: 0.7, depthWrite: false, blending: AdditiveBlending }),
  )
  escenario.add(polvo)

  /* ── estado ── */
  let objetivo = 0
  let actual = 0
  let frente = -1
  let arrastrando = false
  let ultX = 0
  let movido = 0
  let velArrastre = 0
  let ultToque = -10
  let ultAuto = 0
  let pausado = false
  let reloj = 0
  let mx = 0
  let my = 0
  let pmx = 0
  let pmy = 0
  let compu = true
  let entrada = reducido ? 1 : 0 // animación de llegada: el anillo se abre desde el centro
  let barrido = -1

  const indiceFrente = (ang: number) => ((Math.round(-ang / PASO) % N) + N) % N
  const ir = (delta: number) => {
    objetivo = Math.round(objetivo / PASO) * PASO - delta * PASO
    ultToque = reloj
  }

  const rayo = new Raycaster()
  const ndc = new Vector2()
  const tocado = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect()
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
    rayo.setFromCamera(ndc, camara)
    const hit = rayo.intersectObjects(pares.map((p) => p.par))[0]
    return hit ? (hit.object.userData.indice as number) : -1
  }

  const abajo = (e: PointerEvent) => {
    arrastrando = true
    ultX = e.clientX
    movido = 0
    velArrastre = 0
  }
  const mover = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect()
    mx = ((e.clientX - r.left) / r.width) * 2 - 1
    my = ((e.clientY - r.top) / r.height) * 2 - 1
    if (!arrastrando) {
      // la mano sólo cuando el mouse está sobre la escena (no se calcula nada si está en otra parte de la página)
      if (e.pointerType === 'mouse' && e.target === canvas) canvas.style.cursor = tocado(e) >= 0 ? 'pointer' : 'grab'
      return
    }
    const dx = e.clientX - ultX
    ultX = e.clientX
    movido += Math.abs(dx)
    if (movido > 6) canvas.style.cursor = 'grabbing'
    objetivo += dx * 0.0065
    velArrastre = dx * 0.0065
    ultToque = reloj
  }
  const arriba = (e: PointerEvent) => {
    if (!arrastrando) return
    arrastrando = false
    canvas.style.cursor = ''
    if (movido < 6) {
      const i = tocado(e)
      if (i >= 0) {
        const f = indiceFrente(objetivo)
        if (i === f) return onElegir(i)
        let d = i - f
        if (d > N / 2) d -= N
        if (d < -N / 2) d += N
        return ir(d)
      }
    }
    objetivo = Math.round((objetivo + velArrastre * 8) / PASO) * PASO
    ultToque = reloj
  }
  // el arrastre sólo es horizontal: el celular puede seguir scrolleando la página para abajo
  canvas.style.touchAction = 'pan-y'
  canvas.addEventListener('pointerdown', abajo)
  window.addEventListener('pointermove', mover)
  window.addEventListener('pointerup', arriba)
  window.addEventListener('pointercancel', arriba)

  const medir = () => {
    const w = contenedor.clientWidth
    const h = contenedor.clientHeight
    renderer.setSize(w, h, false)
    camara.aspect = w / h
    compu = window.matchMedia('(min-width: 1024px)').matches
    if (compu) {
      escenario.position.set(2.75, 0, 0)
      camara.fov = 32
      camara.position.set(0, 1.5, 11)
    } else {
      escenario.position.set(0, 0.35, 0)
      camara.fov = 38
      camara.position.set(0, 2.0, 9.6)
    }
    camara.updateProjectionMatrix()
  }
  const ro = new ResizeObserver(medir)
  ro.observe(contenedor)
  medir()

  // texturas a la placa de a una por cuadro y shaders compilados en paralelo: el arranque no traba el scroll
  for (const t of texturas) {
    renderer.initTexture(t)
    await new Promise((ok) => requestAnimationFrame(ok))
  }
  await renderer.compileAsync(escena, camara)

  /* ── cuadro a cuadro ── */
  const amortiguar = (a: number, b: number, k: number, dt: number) => a + (b - a) * (1 - Math.exp(-k * dt))
  let raf = 0
  let antes = performance.now()
  let primero = true
  // si va lento, baja la resolución (una vez, después de medir unos 90 cuadros)
  let cuadros = 0
  let acumulado = 0
  let medido = false

  const cuadro = (ahora: number) => {
    const real = (ahora - antes) / 1000
    const dt = Math.min(0.05, real)
    antes = ahora
    if (!medido && reloj > 1.6) {
      cuadros++
      acumulado += real
      if (cuadros === 90) {
        medido = true
        if (acumulado / cuadros > 1 / 40 && topePixeles > 1) {
          topePixeles = 1
          renderer.setPixelRatio(1)
          medir()
          polvo.visible = false
        }
      }
    }
    reloj += dt
    const t = reloj

    entrada = Math.min(1, entrada + dt / 1.6)
    const e = 1 - Math.pow(1 - entrada, 3)

    // giro automático
    const quieto = !reducido && !pausado && !arrastrando && t - ultToque > ESPERA_S && entrada >= 1
    if (quieto && t - ultAuto > AUTO_S) {
      ultAuto = t
      objetivo = Math.round(objetivo / PASO) * PASO - PASO
      barrido = -0.4
    }
    onProgreso?.(quieto ? Math.min(1, (t - ultAuto) / AUTO_S) : 0)

    actual = reducido ? objetivo : amortiguar(actual, objetivo, arrastrando ? 14 : 4.2, dt)
    anillo.rotation.y = actual - (1 - e) * 1.2
    aro.rotation.z = -actual * 0.5 + t * 0.04
    aro.scale.setScalar(0.6 + 0.4 * e)

    pmx = amortiguar(pmx, mx, 3, dt)
    pmy = amortiguar(pmy, my, 3, dt)
    camara.lookAt(compu ? 1.35 + pmx * 0.25 : pmx * 0.2, compu ? -0.15 - pmy * 0.15 : 0.05 - pmy * 0.1, 0)

    // brillo que cruza el par del frente al llegar
    barrido = barrido < 2 ? barrido + dt * 1.5 : barrido

    const fi = indiceFrente(actual)
    for (const p of pares) {
      const w = anillo.rotation.y + p.a
      const radio = R * e
      p.soporte.position.set(Math.sin(p.a) * radio, PISO, Math.cos(p.a) * radio)
      const z = Math.cos(w)
      const f = (z + 1) / 2
      const f5 = Math.pow(f, 5)
      const s = (0.45 + (compu ? 0.85 : 1.3) * f5) * (0.5 + 0.5 * e)
      // el del frente se balancea un poco para que se note el volumen
      const vaiven = reducido ? 0 : Math.sin(t * 0.7 + p.fase) * 0.22 * f5
      p.soporte.rotation.y = -anillo.rotation.y - Math.sin(w) * 0.35 + vaiven
      p.pivote.scale.setScalar(s)
      const flota = reducido ? 0 : Math.sin(t * 1.6 + p.fase) * 0.06 * (0.4 + f)
      const alto = H / 2 + 0.2 + flota + f5 * 0.12
      p.par.position.y = alto
      p.reflejo.position.y = -alto
      p.par.rotation.z = p.reflejo.rotation.z = (reducido ? 0 : Math.sin(t * 1.1 + p.fase) * 0.03) * (1 - f5 * 0.5)
      const m = p.par.material as ShaderMaterial
      m.uniforms.uBrillo.value = 0.18 + 0.82 * Math.pow(f, 1.6)
      m.uniforms.uOpacidad.value = Math.min(1, e * 1.5)
      m.uniforms.uBarrido.value = p === pares[fi] ? barrido : -1
      const mr = p.reflejo.material as ShaderMaterial
      mr.uniforms.uBrillo.value = 0.6 * f
      mr.uniforms.uOpacidad.value = 0.35 * f5 * e
      ;(p.sombra.material as MeshBasicMaterial).opacity = (0.25 + 0.6 * f) * (1 - flota * 2) * e
      p.sombra.scale.setScalar(1 - flota * 1.5)
    }

    const pa = polvo.geometry.attributes.position as BufferAttribute
    for (let i = 0; i < P; i++) {
      let y = pa.array[i * 3 + 1] + vel[i] * dt
      if (y > PISO + 4.5) y = PISO
      pa.array[i * 3 + 1] = y
    }
    pa.needsUpdate = true

    if (fi !== frente) {
      frente = fi
      onFrente(fi)
    }
    renderer.render(escena, camara)
    if (primero) {
      primero = false
      onListo?.()
    }
    raf = requestAnimationFrame(cuadro)
  }

  // pausa cuando la portada sale de pantalla o la pestaña queda atrás
  let enPantalla = true
  const sincronizar = () => {
    const debe = enPantalla && !document.hidden
    if (debe && !raf) {
      antes = performance.now()
      cuadros = 0
      acumulado = 0
      raf = requestAnimationFrame(cuadro)
    }
    if (!debe && raf) {
      cancelAnimationFrame(raf)
      raf = 0
    }
  }
  const io = new IntersectionObserver(([en]) => {
    enPantalla = en.isIntersecting
    sincronizar()
  })
  io.observe(contenedor)
  document.addEventListener('visibilitychange', sincronizar)
  sincronizar()

  return {
    ir,
    pausar: (si) => {
      pausado = si
      if (!si) ultAuto = reloj
    },
    destruir: () => {
      cancelAnimationFrame(raf)
      raf = 0
      io.disconnect()
      ro.disconnect()
      document.removeEventListener('visibilitychange', sincronizar)
      canvas.removeEventListener('pointerdown', abajo)
      window.removeEventListener('pointermove', mover)
      window.removeEventListener('pointerup', arriba)
      window.removeEventListener('pointercancel', arriba)
      escena.traverse((o) => {
        const m = o as Mesh
        m.geometry?.dispose()
        const mat = m.material as MeshBasicMaterial | ShaderMaterial | undefined
        mat?.dispose()
      })
      ;[...texturas, texSombra, texLuz, texPunto, texAro].forEach((t) => t.dispose())
      renderer.dispose()
      renderer.forceContextLoss()
      canvas.remove()
    },
  }
}
