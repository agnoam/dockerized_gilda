FROM bitnami/nginx:1.21.4-debian-10-r26

COPY default.conf /opt/bitnami/nginx/conf/server_blocks/gateway.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]