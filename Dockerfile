FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY AlmoxarifadoSenai.Api/AlmoxarifadoSenai.Api.csproj AlmoxarifadoSenai.Api/
RUN dotnet restore AlmoxarifadoSenai.Api/AlmoxarifadoSenai.Api.csproj

COPY AlmoxarifadoSenai.Api/ AlmoxarifadoSenai.Api/
RUN dotnet publish AlmoxarifadoSenai.Api/AlmoxarifadoSenai.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080

CMD ASPNETCORE_URLS=http://+:${PORT:-8080} dotnet AlmoxarifadoSenai.Api.dll
