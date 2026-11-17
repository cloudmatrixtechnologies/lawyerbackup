FROM eclipse-temurin:25-jdk AS build
WORKDIR /app
COPY . .
RUN if [ -f mvnw ]; then sed -i 's/\r$//' mvnw && chmod +x mvnw && ./mvnw clean package -DskipTests; else apt-get update && apt-get install -y maven && mvn clean package -DskipTests; fi

FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]