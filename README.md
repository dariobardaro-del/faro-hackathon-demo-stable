# FARO · PoC Hackathon

Consola demostrable para un agente de OpenClaw que recibe incidencias de un festival ficticio y propone una acción trazable, siempre con aprobación humana antes de ejecutar.

## Ejecutar la consola

Abrir `index.html` en un navegador. No requiere instalación, credenciales ni conexión a servicios externos.

Para ejecutar una incidencia real desde el simulador, usar `node server.mjs` y abrir `http://127.0.0.1:4173`. El servidor sólo escucha localmente.

## Ejecutar el núcleo de agente

`bash run-faro-demo.sh` envía el caso de persona descompensada a una vuelta local de OpenClaw con modelo Terra. Para otro caso: `bash run-faro-demo.sh test-incidents/INC-102.json`. No entrega mensajes a ningún canal y exige una salida JSON trazable. Requiere que el gateway y el modelo estén disponibles en la máquina de demostración.

## Recorrido de demo (90 segundos)

1. Abrir `INC-101`: FARO recibe una alerta desde radio interna de staff y consulta plano + protocolo.
2. Mostrar que decide escalar a Seguridad y bloquea publicación pública.
3. Pulsar **Aprobar acción**: la traza deja la decisión humana registrada.
4. Abrir `INC-103`: FARO prepara un aviso para pantallas y altavoces, pero sólo lo emite tras validación humana.
5. Abrir `INC-102`: FARO recomienda no publicar un rumor no confirmado recibido por monitoreo.
6. Opcional: usar **Simular incidencia** para mostrar una entrada nueva en vivo.

## Límites explícitos de la PoC

- Los datos, plano y protocolos son sintéticos.
- La consola no envía mensajes ni activa recursos externos.
- La aprobación humana se registra sólo en memoria del navegador durante la demostración.

## De dónde llegan las incidencias

En un despliegue real, la mesa de control recibiría entradas de radio o formularios del staff, partes de Operaciones y Logística, y monitoreo de redes o canales internos. FARO normaliza cada aviso, lo cruza con el plano y los protocolos, y lo presenta a un responsable de turno. En esta demo esas entradas son sintéticas: no hay conexiones externas ni publicaciones reales.

## Estructura de decisión

`incidencia → plano/protocolo → recomendación FARO → aprobación humana → traza`
