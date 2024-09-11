# Use the official pg_tileserv image
FROM pramsey/pg_tileserv

ENV PGHOST=$PGHOST
ENV PGPORT=$PGPORT
ENV PGUSER=$PGUSER
ENV PGPASSWORD=$PGPASSWORD
ENV PGDATABASE=$PGDATABASE

COPY pg_tileserv.toml /config/pg_tileserv.toml

EXPOSE 8080

# Default command to start pg_tileserv
CMD ["pg_tileserv"]