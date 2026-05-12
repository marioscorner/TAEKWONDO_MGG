import Image from "next/image";
import Link from "next/link";
import taekwondo from "../../public/tkd_main.jpg";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-12 sm:py-16">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-martial md:grid-cols-2 md:p-10">
          {/* Columna izquierda: texto */}
          <div className="flex flex-col gap-6">
            <div className="w-fit rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-red-100">Madrid · Arganzuela</div>
            <h1 className="text-5xl font-bold leading-tight tracking-tight md:text-6xl">
              Taekwondo Mario Gutiérrez
            </h1>
            <p className="text-xl leading-relaxed text-slate-200">
              Entrena con disciplina. Progresa con criterio. Crece dentro y fuera del tatami.
            </p>
            <div className="flex flex-wrap gap-4 mt-4">
              <Link
                href="/register"
                className="rounded-xl bg-red-700 px-8 py-3 font-bold text-white shadow-lg transition-colors hover:bg-red-900"
              >
                Únete ahora
              </Link>
              <Link
                href="/about"
                className="rounded-xl border-2 border-white/20 bg-white/10 px-8 py-3 font-bold text-white transition-colors hover:bg-white/20"
              >
                Sobre mí
              </Link>
            </div>
          </div>

          {/* Columna derecha: imagen */}
          <div className="flex justify-center">
            <Image
              src={taekwondo}
              alt="Practicante de Taekwondo"
              width={600}
              height={500}
              className="rounded-[1.5rem] object-cover shadow-2xl ring-1 ring-white/10"
              priority
            />
          </div>
        </div>
      </section>

      {/* ¿Qué es el Taekwondo? */}
      <section className="bg-white py-20 dark:bg-slate-900">
        <div className="container mx-auto px-6 max-w-6xl">
          <h2 className="mb-12 text-center text-4xl font-bold text-slate-950 dark:text-white">
            ¿Qué es el Taekwondo?
          </h2>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 dark:border-slate-800 dark:bg-slate-950/50">
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Un Arte Marcial Completo
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                El <strong>Taekwondo</strong> es un arte marcial de origen
                coreano que combina técnicas de defensa personal con un profundo
                enfoque en el desarrollo físico y mental. Es un deporte olímpico
                que destaca por sus potentes y variadas patadas, así como por
                los valores que promueve: respeto, disciplina, autocontrol y
                perseverancia.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 dark:border-slate-800 dark:bg-slate-950/50">
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Cuerpo y Mente en Armonía
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Además de ser una práctica deportiva, el Taekwondo busca formar
                el carácter de quien lo entrena, fomentando la armonía entre
                cuerpo y mente. En competición, se divide en dos modalidades
                principales: <em>combate</em> (kyorugi) y <em>poomsae</em>{" "}
                (formas técnicas).
              </p>
            </div>
          </div>

          <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-8 dark:border-red-900/70 dark:bg-red-950/20">
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              📋 Inscripciones
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
              Las inscripciones se realizan{" "}
              <strong>directamente en el centro</strong> donde se imparten las
              clases. Puedes acercarte en el horario de entrenamiento o
              contactarme para más información.
            </p>
          </div>
        </div>
      </section>

      {/* Dónde Encontrarme */}
      <section className="bg-slate-50 py-20 dark:bg-slate-950">
        <div className="container mx-auto px-6 max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900 dark:text-white">
            📍 Actualmente estoy enseñando en:
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12 text-lg">
            Ven a conocernos y forma parte de nuestra comunidad
          </p>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Información del lugar */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                Centro Dotacional Integrado Arganzuela
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📍</span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Dirección:
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      Calle Canarias, 17
                      <br />
                      Arganzuela, 28045 Madrid, España
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-2xl">🚇</span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Metro:
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      Línea 3 - Parada: Palos de la Frontera
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-2xl">⏰</span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Horarios:
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      Martes y Jueves: 17:00 - 20:00
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Centro+Dotacional+Integrado+Arganzuela,+Calle+Canarias+17,+28045+Madrid"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-semibold text-red-700 hover:underline dark:text-red-300"
                  >
                    🗺️ Ver indicaciones en Google Maps
                  </a>
                </div>
              </div>
            </div>

            {/* Mapa de Google */}
            <div className="h-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <iframe
                src="https://www.google.com/maps?q=Centro+Dotacional+Integrado+Arganzuela,+Calle+Canarias+17,+28045+Madrid&output=embed"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-lg"
                title="Centro Dotacional Integrado Arganzuela"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Enlaces Oficiales */}
      <section className="bg-white py-16 dark:bg-slate-900">
        <div className="container mx-auto px-6 max-w-6xl">
          <h3 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Enlaces Oficiales
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href="https://fmtaekwondo.es/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-slate-100 p-4 text-center transition-colors hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-950/30"
            >
              <p className="font-semibold text-gray-900 dark:text-white">
                Federación Madrileña
              </p>
            </a>
            <a
              href="https://rfetaekwondo.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-slate-100 p-4 text-center transition-colors hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-950/30"
            >
              <p className="font-semibold text-gray-900 dark:text-white">
                Federación Española
              </p>
            </a>
            <a
              href="https://worldtaekwondo.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-slate-100 p-4 text-center transition-colors hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-950/30"
            >
              <p className="font-semibold text-gray-900 dark:text-white">
                World Taekwondo
              </p>
            </a>
            <a
              href="https://olympics.com/es/deportes/taekwondo/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-slate-100 p-4 text-center transition-colors hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-950/30"
            >
              <p className="font-semibold text-gray-900 dark:text-white">
                Taekwondo Olímpico
              </p>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
