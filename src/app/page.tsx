import Image from "next/image";
import Link from "next/link";
import taekwondo from "../../public/tkd_main.jpg";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Columna izquierda: texto */}
          <div className="flex flex-col gap-6">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
              Taekwondo
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Arte marcial, deporte olímpico y camino de desarrollo personal
            </p>
            <div className="flex flex-wrap gap-4 mt-4">
              <Link
                href="/register"
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
              >
                Únete ahora
              </Link>
              <Link
                href="/about"
                className="px-8 py-3 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg border-2 border-gray-300 dark:border-gray-600 transition-colors"
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
              className="rounded-2xl object-cover shadow-2xl"
              priority
            />
          </div>
        </div>
      </section>

      {/* ¿Qué es el Taekwondo? */}
      <section className="bg-white dark:bg-gray-800 py-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            ¿Qué es el Taekwondo?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-xl">
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Un Arte Marcial Completo
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                El <strong>Taekwondo</strong> es un arte marcial de origen coreano
                que combina técnicas de defensa personal con un profundo enfoque
                en el desarrollo físico y mental. Es un deporte olímpico que
                destaca por sus potentes y variadas patadas, así como por los
                valores que promueve: respeto, disciplina, autocontrol y
                perseverancia.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-xl">
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Cuerpo y Mente en Armonía
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Además de ser una práctica deportiva, el Taekwondo busca formar el
                carácter de quien lo entrena, fomentando la armonía entre cuerpo y
                mente. En competición, se divide en dos modalidades principales:{" "}
                <em>combate</em> (kyorugi) y <em>poomsae</em> (formas técnicas).
              </p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/30 p-8 rounded-xl border-2 border-blue-200 dark:border-blue-700">
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              📋 Inscripciones
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
              Las inscripciones se realizan <strong>directamente en el centro</strong> donde se imparten las clases.
              Puedes acercarte en el horario de entrenamiento o contactarme para más información.
            </p>
          </div>
        </div>
      </section>

      {/* Dónde Encontrarme */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-6 max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900 dark:text-white">
            📍 Actualmente estoy enseñando en:
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12 text-lg">
            Ven a conocernos y forma parte de nuestra comunidad
          </p>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Información del lugar */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                Centro Dotacional Integrado Arganzuela
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📍</span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Dirección:</p>
                    <p className="text-gray-700 dark:text-gray-300">
                      C. de Palos de la Frontera, 40<br />
                      Arganzuela, 28045 Madrid, España
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-2xl">🚇</span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Metro:</p>
                    <p className="text-gray-700 dark:text-gray-300">
                      Línea 3 y 6 - Parada: Arganzuela-Planetario
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-2xl">⏰</span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Horarios:</p>
                    <p className="text-gray-700 dark:text-gray-300">
                      Consultar horarios en el centro<br />
                      o contactar para más información
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <a
                    href="https://www.google.com/maps/dir//C.+de+Palos+de+la+Frontera,+40,+Arganzuela,+28045+Madrid"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    🗺️ Ver indicaciones en Google Maps
                  </a>
                </div>
              </div>
            </div>

            {/* Mapa de Google */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg h-full">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3037.5!2d-3.7006647!3d40.395887!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDIzJzQ1LjIiTiAzwrA0MicwMi40Ilc!5e0!3m2!1ses!2ses!4v1234567890"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-lg"
                title="Ubicación: C. de Palos de la Frontera, 40, Arganzuela, 28045 Madrid"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Enlaces Oficiales */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-6 max-w-6xl">
          <h3 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Enlaces Oficiales
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href="https://fmtaekwondo.es/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg text-center transition-colors"
            >
              <p className="font-semibold text-gray-900 dark:text-white">Federación Madrileña</p>
            </a>
            <a
              href="https://rfetaekwondo.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg text-center transition-colors"
            >
              <p className="font-semibold text-gray-900 dark:text-white">Federación Española</p>
            </a>
            <a
              href="https://worldtaekwondo.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg text-center transition-colors"
            >
              <p className="font-semibold text-gray-900 dark:text-white">World Taekwondo</p>
            </a>
            <a
              href="https://olympics.com/es/deportes/taekwondo/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg text-center transition-colors"
            >
              <p className="font-semibold text-gray-900 dark:text-white">Taekwondo Olímpico</p>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
