FROM node:16

ARG PACKAGE

ENV PACKAGE $PACKAGE

ARG DEPS

ENV DEPS $DEPS

RUN echo ${PACKAGE}

RUN mkdir /usr/app

COPY ./ /usr/app

RUN for dep in ${DEPS} ; do cd /usr/app/$dep && npm install && rm -rf /usr/app/$dep/dist && npx tsc ; done

WORKDIR /usr/app/${PACKAGE}

RUN rm -rf /usr/app/${PACKAGE}/dist

RUN for dep in ${DEPS} ; do npm link ../"$dep" ; done

RUN npm install

RUN npx tsc

ENTRYPOINT [ "npm", "run", "serve" ]