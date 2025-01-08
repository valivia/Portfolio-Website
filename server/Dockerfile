FROM rust:1 as builder
WORKDIR /app
COPY . .
RUN cargo install --path .

FROM debian:buster-slim as runner

COPY --from=builder /usr/local/cargo/bin/portfolio-server /usr/local/bin/portfolio-server
COPY --from=builder /app/.env .env
COPY --from=builder /app/Rocket.toml Rocket.toml
RUN echo "$PWD"

EXPOSE 8080

CMD ["portfolio-server"]