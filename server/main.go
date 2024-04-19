package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

// Game represents a chess game
type Game struct {
	ID          string    `json:"id,omitempty" bson:"_id,omitempty"`
	GameName    string    `json:"gamename,omitempty" bson:"gamename,omitempty"`
	Player1     string    `json:"player1,omitempty" bson:"player1,omitempty"`
	Player2     string    `json:"player2,omitempty" bson:"player2,omitempty"`
	Moves       []string  `json:"moves,omitempty" bson:"moves,omitempty"`
	CreatedAt   time.Time `json:"createdAt,omitempty" bson:"createdAt,omitempty"`
	LastUpdated time.Time `json:"lastUpdated,omitempty" bson:"lastUpdated,omitempty"`
}

var client *mongo.Client

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Get MongoDB connection URI from environment variables
	url := os.Getenv("MONGODB_URI")
	if url == "" {
		log.Fatal("MONGODB_URI")
	}

	// Create MongoDB client options
	clientOptions := options.Client().ApplyURI(url)

	// Connect to MongoDB
	var err error
	client, err = mongo.Connect(context.Background(), clientOptions)
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}
	defer func() {
		err = client.Ping(context.Background(), readpref.Primary())
		if err := client.Disconnect(context.Background()); err != nil {
			log.Printf("Error disconnecting from MongoDB: %v", err)
			log.Fatal(err)
		}
		Database, err := client.ListDatabaseNames(context.Background(), bson.M{})
		if err != nil {
			log.Fatalf("Failed to connect to MongoDB: %v", err)
		} else {
			fmt.Println("Connected to MongoDB!")
		}
		fmt.Println(Database)
	}()

	// Initialize router
	router := mux.NewRouter()

	// Define API endpoints
	// router.HandleFunc("/games", getGames).Methods("GET")
	router.HandleFunc("/games", createGame).Methods("POST")
	router.HandleFunc("/games/{id}", getGame).Methods("GET")
	router.HandleFunc("/games/{id}", updateGame).Methods("PUT")
	router.HandleFunc("/games/{id}", deleteGame).Methods("DELETE")

	// Set up CORS middleware
	c := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:3000"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE"},
	})

	// Wrap the router with CORS middleware
	handler := c.Handler(router)

	// Start HTTP server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Server listening on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))

}

// Helper function to get the MongoDB collection
func getCollection() *mongo.Collection {
	return client.Database("chess").Collection("games")
}

func createGame(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	log.Printf("Received request: %s %s", r.Method, r.URL.Path)
	// Parse the request body into a Game struct
	var game Game
	err := json.NewDecoder(r.Body).Decode(&game)
	if err != nil {
		http.Error(w, "Failed to decode request body", http.StatusBadRequest)
		return
	}

	// Set CreatedAt and LastUpdated timestamps
	game.CreatedAt = time.Now()
	game.LastUpdated = game.CreatedAt

	// Get the MongoDB collection
	collection := getCollection()

	// Insert the game document into the collection
	result, err := collection.InsertOne(context.Background(), game)
	if err != nil {
		http.Error(w, "Failed to insert game into database", http.StatusInternalServerError)
		return
	}

	// Set the ID of the inserted game and return it in the response
	game.ID = result.InsertedID.(primitive.ObjectID).Hex()
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(game)
}

// Handler function to get a game by ID
func getGame(w http.ResponseWriter, r *http.Request) {
	// Set the Content-Type header to application/json
	w.Header().Set("Content-Type", "application/json")
	log.Printf("Received request: %s %s", r.Method, r.URL.Path)

	params := mux.Vars(r)
	hexId := params["id"]
	var game Game

	// Specify the database and collection
	collection := getCollection()
	id, err := primitive.ObjectIDFromHex(hexId)
	if err != nil {
		http.Error(w, "Game not found", http.StatusNotFound)
		return
	}

	// Create a filter to find the document by ID
	gameDoc := collection.FindOne(context.Background(), bson.M{"_id": id}).Decode(&game)

	// Find the document by ID
	if gameDoc != nil {
		log.Printf("Find the document by ID %v", gameDoc)
	}

	fmt.Printf("Found a single document: %+v\n", game)
	json.NewEncoder(w).Encode(game)
}

// Handler function to update a game by ID
func updateGame(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	log.Printf("Received request: %s %s", r.Method, r.URL.Path)
	// Get the ID parameter from the URL
	params := mux.Vars(r)
	id := params["id"]

	// Parse the request body into a Game struct
	var updatedGame Game
	err := json.NewDecoder(r.Body).Decode(&updatedGame)
	if err != nil {
		http.Error(w, "Failed to decode request body", http.StatusBadRequest)
		return
	}

	// Set the LastUpdated timestamp
	updatedGame.LastUpdated = time.Now()

	// Convert the ID string to BSON ObjectID
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	// Get the MongoDB collection
	collection := getCollection()

	// Define the filter to find the document by ID
	filter := bson.M{"_id": objID}

	// Define the update operation
	update := bson.M{"$set": updatedGame}

	// Perform the update operation
	_, err = collection.UpdateOne(context.Background(), filter, update)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(updatedGame)
}

// Handler function to delete a game by ID
func deleteGame(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	log.Printf("Received request: %s %s", r.Method, r.URL.Path)
	params := mux.Vars(r)
	id := params["id"]

	// Convert the ID string to BSON ObjectID
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	// Delete the document by ID
	_, err = getCollection().DeleteOne(context.Background(), bson.M{"_id": objID})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
