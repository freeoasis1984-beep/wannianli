FROM public-cn-beijing.cr.volces.com/public/base:node-16-alpine

WORKDIR /opt/application/

COPY . .

USER root

RUN npm install --production --registry=https://registry.npmmirror.com

RUN chmod -R 777 /opt/application/run.sh

EXPOSE 8000

CMD /opt/application/run.sh
