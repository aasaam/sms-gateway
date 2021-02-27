FROM node:15-buster-slim

LABEL org.label-schema.name="sms-gateway" \
      org.label-schema.description="Wrapper service for sending, logging and testing Short Message Service(SMS)" \
      org.label-schema.url=https://github.com/aasaam/sms-gateway \
      org.label-schema.vendor="aasaam" \
      maintainer="Muhammad Hussein Fattahizadeh <m@mhf.ir>"

COPY ./app /app

RUN cd /app/cp \
  && npm install \
  && npm run generate:modern \
  && cd /app/api \
  && npm install --production \
  && rm -rf /app/api/public \
  && mv /app/cp/dist /app/api/public
