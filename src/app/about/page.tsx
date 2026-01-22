"use client";

import Image from "next/image";
import photo1 from "../../../public/tkd_sek.webp";
import photo2 from "../../../public/dq_mario.webp";
import photo3 from "../../../public/MY_PHOTO.webp";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function About() {
  const photos = [
    { src: photo1, alt: "Mario Gutiérrez - Práctica de Taekwondo" },
    { src: photo2, alt: "Mario Gutiérrez - Taekwondo" },
    { src: photo3, alt: "Mario Gutiérrez - Entrenamiento de Taekwondo" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black py-16">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Título */}
        <h1 className="text-5xl font-bold text-center mb-4 text-gray-900 dark:text-white">
          Sobre mí
        </h1>
        <div className="w-24 h-1 bg-blue-600 mx-auto mb-12"></div>

        {/* Grid principal: Carrusel y Texto */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Carrusel de fotos */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={30}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
              }}
              loop={photos.length > 1}
              className="rounded-xl"
            >
              {photos.map((photo, index) => (
                <SwiperSlide key={index}>
                  <div className="relative w-full h-[500px]">
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      className="object-cover rounded-xl"
                      priority={index === 0}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            
          </div>

          {/* Texto sobre mí */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
              <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                👋 ¡Hola! Soy Mario Gutiérrez
              </h2>
              
              <div className="space-y-4 text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                <p>
                  Llevo practicando <strong>Taekwondo</strong> desde que tengo memoria, 
                  y hace casi <strong>10 años</strong> que me embarqué en la aventura de 
                  devolverle al Taekwondo todo lo que me ha dado.
                </p>

                <p>
                  Me apasiona <strong>compartir mis conocimientos y experiencias</strong> con mis
                  alumnos, ayudándoles a crecer tanto en habilidades marciales como en
                  confianza personal.
                </p>

                <p>
                  Mi objetivo es crear un <strong>ambiente de aprendizaje positivo y
                  motivador</strong>, donde cada estudiante pueda alcanzar su máximo potencial.
                </p>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-6">
                  <p>
                    Pero no todo es Taekwondo en mi vida. También disfruto de la <strong>música,
                    la lectura</strong> y otros tantos hobbies. Creo que el Taekwondo es algo que
                    nos acompaña durante nuestra vida y nos ayuda a enfrentar los
                    desafíos que se nos plantean, pero también soy consciente de que no
                    solo nos define esto, sino también más cosas.
                  </p>
                </div>

                <p className="text-blue-600 dark:text-blue-400 font-semibold text-xl pt-4">
                  ¡Espero que nos veamos pronto! 🥋
                </p>
              </div>
            </div>

            {/* Botón CTA */}
            <div className="flex justify-center">
              <a
                href="/register"
                className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-lg text-lg"
              >
                Únete a las clases
              </a>
            </div>
          </div>
        </div>

        {/* Sección adicional: Valores */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Los valores que transmito
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center">
              <div className="text-5xl mb-4">🥋</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Disciplina</h3>
              <p className="text-gray-600 dark:text-gray-400">
                La constancia y el esfuerzo son la base del progreso
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center">
              <div className="text-5xl mb-4">🤝</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Respeto</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Hacia uno mismo, los compañeros y el arte marcial
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center">
              <div className="text-5xl mb-4">💪</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Superación</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Cada día es una oportunidad para mejorar
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
