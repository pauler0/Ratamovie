import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { faEdit } from "@fortawesome/free-solid-svg-icons";

let API = "http://localhost:3000/api";

const calculateAverageRating = (reviews) => {
  if (reviews.length === 0) {
    return 0;
  }
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  return totalRating / reviews.length;
};

const StarRating = ({
  rating,
  onClick,
  starColor = "#D9AC25",
  emptyStarColor = "rgb(30, 30, 30)",
  starSize = "1x",
}) => {
  const stars = Array.from({ length: 5 }, (_, index) => (
    <FontAwesomeIcon
      icon={faStar}
      key={index}
      color={index < rating ? starColor : emptyStarColor}
      onClick={() => onClick(index + 1)}
      style={{ fontsize: starSize }}
    />
  ));

  return <div>{stars}</div>;
};

// eslint-disable-next-line react/prop-types
function SingleMovie({ token, setUserId, userId, setMyReviews }) {
  const [movie, setMovie] = useState({});
  const [reviews, setReviews] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [content, setContent] = useState("");
  const [userName, setUserName] = useState("");
  const [movieId, setMovieId] = useState(0);
  const [comments, setComments] = useState({});
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [updatedReviewContent, setUpdatedReviewContent] = useState("");


  const [isReviewing, setIsReviewing] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { id } = useParams();

  useEffect(() => {
    fetchMovie();
    fetchReviews();
  }, [id, isLoading]);

  async function fetchMovie() {
    try {
      setIsLoading(true);

      const { data } = await axios.get(`${API}/movies/${id}`);
      setMovie(data);
    } catch (err) {
      console.error("Error fetching movie details:", err.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchReviews() {
    try {
      setIsLoading(true);

      const { data } = await axios.get(`${API}/reviews/${id}`);
      //console.log("Server response:", data.reviews);
      setReviews(data.reviews);
      //setComments(data.comments);
      if (Array.isArray(data.reviews) && data.reviews.length > 0) {
        // Extract comments from each review
        const allComments = data.reviews.flatMap((review) => review.comments);
        //console.log("All Comments:", allComments);
        setComments(allComments);
      } else {
        console.log("No reviews found.");
        setComments([]);
        // console.log("after setComments:", comments)
      }
    } catch (err) {
      console.error("Error fetching reviews:", err.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleReview(event) {
    event.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${API}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: content,
          rating: userRating,
          name: userName,
          movieId: movie.id,
          userId: userId,
        }),
      });
      console.log("Review submitted successfully!");
      const result = await response.json();
      // console.log("Response from server:", result);
      // Check if the result is an object with review details
      if (result.id) {
        // Update the state by adding the new review to the existing reviews array
        setReviews((prevReviews) => [...prevReviews, result]);
        setMyReviews((prevReviews) => [...prevReviews, result]);
      } else {
        console.error("Invalid response format: ", result);
      }

      //setNewReview();
      setContent("");
      setUserRating(0);
      setUserName("");
      setMovieId(0);
      setUserId(0);
    } catch (error) {
      console.error("Error submitting review: ", error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleComments(event, reviewId) {
    event.preventDefault();
    setIsLoading(true);
    try {
      // console.log("content:", content);
      // console.log("reviewId:", reviewId);
      // console.log("userId:", userId);
      const response = await fetch(`${API}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: content,
          reviewId: reviewId,
          userId: userId,
        }),
      });
      // console.log("comment response:", response);
      console.log("Comment submitted successfully!");
      const result = await response.json();
      // console.log("Response from server:", result);
      // Check if the result is an object with review details
      if (result.id) {
        // Update the state by adding the new review to the existing reviews array
        setComments((prevReviews) => [...prevReviews, result]);
        //setMyReviews(prevReviews => [...prevReviews, result]);
      } else {
        console.error("Invalid response format: ", result);
      }

      setContent("");
      setIsReviewing(null);
      //setNewReview();
      //setUserName("");
      // setReviewId(0);
    } catch (error) {
      console.error("Error submitting review: ", error.message);
    } finally {
      setIsLoading(false);
    }
  }

  // const editReview = async (reviewId) => {
  //   try {
  //     setIsLoading(true);

  //     const response = await axios.patch(
  //       `${API}/reviews/${reviewId}`,
  //       { updatedReview: updatedReview },
  //       {
  //         headers: {
  //           'Authorization': `Bearer ${token}`,
  //           'Content-Type': 'application/json',
  //         },
  //       }
  //     );

  //     if (response.status === 200) {
  //       // Optionally update the state or perform any additional actions
  //       console.log('Review updated successfully!');
  //       // Update the state or perform any other actions as needed
  //     } else {
  //       console.error('Failed to update review:', response.data.message);
  //     }
  //   } catch (error) {
  //     console.error('Error updating review:', error.message);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  // const handleEditReview = async (event, reviewId, updatedReviewContent) => {
  //   event.preventDefault();
  //   setIsLoading(true);

  //   try {
  //     if (!updatedReviewContent) {
  //       console.error('Invalid updated review data');
  //       return;
  //     }
  //     console.log("update review content and token:", updatedReviewContent, token)
  //     const response = await axios.put(
  //       `/api/reviews/${reviewId}`,
  //       { updatedReview: updatedReviewContent },
  //       {
  //         headers: {
  //           authorization: token,
  //         },
          
  //       }
  //     );
  //       console.log("edit response:", response)
  //     if (response.status === 200) {
  //       // Update the state or perform any additional actions
  //       console.log('Review updated successfully!');
  //       // Reset the editing state
  //       setEditingReviewId(null);
  //       setUpdatedReviewContent("");
  //       // Optionally, fetch updated reviews
  //       await fetchReviews();
  //     } else {
  //       console.error('Failed to update review:', response.data.message);
  //     }
  //   } catch (error) {
  //     console.error('Error updating review:', error.message);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleEditReview = async (event, reviewId, updatedReviewContent) => {
    event.preventDefault();
    setIsLoading(true);
  
    try {
      if (!updatedReviewContent) {
        console.error('Invalid updated review data');
        return;
      }
  
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ updatedReview: updatedReviewContent }),
      });
  
      if (response.ok) {
        // Update the state or perform any additional actions
        console.log('Review updated successfully!');
        // Reset the editing state
        setEditingReviewId(null);
        setUpdatedReviewContent("");
        // Optionally, fetch updated reviews
        await fetchReviews();
      } else {
        const errorData = await response.json();
        console.error('Failed to update review:', errorData.message);
      }
    } catch (error) {
      console.error('Error updating review:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  async function deleteReview(reviewId) {
    setIsLoading(true);

    try {
      const response = await axios.delete(`${API}/reviews/${reviewId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        // Remove the deleted review from the state
        setReviews((prevReviews) =>
          prevReviews.filter((review) => review.id !== reviewId)
        );

        await fetchReviews();

        // Optionally update other state variables or perform any additional actions
        console.log("Review deleted successfully!");
      } else {
        console.error("Failed to delete review:", response.data.message);
      }
    } catch (error) {
      console.error("Error deleting review:", error.message);
    } finally {
      setIsLoading(false);
    }
  }
  async function deleteComment(commentId) {
    setIsLoading(true);

    try {
      const response = await axios.delete(`${API}/comments/${commentId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        // Remove the deleted comment from the state
        setComments((prevComments) =>
          prevComments.filter((comment) => comment.id !== commentId)
        );

        // Optionally update other state variables or perform any additional actions
        console.log("Comment deleted successfully!");
      } else {
        console.error("Failed to delete comment:", response.data.message);
      }
    } catch (error) {
      console.error("Error deleting comment:", error.message);
    } finally {
      setIsLoading(false);
    }
  }

  const averageRating = calculateAverageRating(reviews);

  const handleStarClick = (selectedRating) => {
    setUserRating(selectedRating);
    console.log(`User clicked on star ${selectedRating}`);
  };

  return (
    <>
      <div className="details">
        {isLoading && <p>Loading...</p>}

        {movie.id ? (
          <div className="singleMovie">
            <div className="movie-poster">
              <img src={movie.image} alt={movie.title} />
              {/* <div className="average-rating">
                <p>RATINGS</p>
                <StarRating rating={averageRating} />
              </div> */}
            </div>

            <div className="movie-title">
              <h2>{movie.title}</h2>
              <p>
                {movie.year} Directed by {movie.director}
              </p>
            </div>

            <div className="movie-des">
              <p>{movie.description}</p>
            </div>

            <div className="movie-reviews">
              <h3>REVIEWS</h3>
              <hr />
              {reviews.map((review) => (
                <div className="reviews" key={review.id}>
                  <p className="review-container">
                    Review by {review.name}{" "}
                    <StarRating rating={review.rating} />
                    <FontAwesomeIcon
                      icon={faTrash}
                      className="delete-review-icon"
                      onClick={() => deleteReview(review.id)}
                    />
                    {token && review.userId === userId && (
                      <FontAwesomeIcon
                        icon={faEdit}
                        className="edit-review-icon"
                        onClick={() => setEditingReviewId(review.id)}
                      />
                    )}
                  </p>
                  {editingReviewId === review.id ? (
                    <form onSubmit={(e) => handleEditReview(e, review.id, updatedReviewContent)}>
                      <input
                        type="text"
                        placeholder="Edit your review..."
                        value={updatedReviewContent}
                        onChange={(e) => setUpdatedReviewContent(e.target.value)}
                      />
                      <button type="submit">Save</button>
                      <button type="button" onClick={() => setEditingReviewId(null)}>
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <p>{review.content}</p>
                  )}

                  <div className="comments">
                    {comments &&
                      comments
                        .filter((comment) => comment.reviewId === review.id)
                        .map((comment) => (
                          <div key={comment.id} className="comment-container">
                            <p>Commented: {comment.content}</p>
                            {token && (
                              <FontAwesomeIcon
                                icon={faTrash}
                                className="delete-comment-icon"
                                onClick={() => deleteComment(comment.id)}
                              />
                            )}
                          </div>
                        ))}
                  </div>


                  <button
                    className="add-comment"
                    onClick={() => setIsReviewing(review.id)}
                  >
                    + Comment
                  </button>

                  {/* Render comment input if the review is being commented on */}
                  {isReviewing === review.id && (
                    <form
                      className="comment-form"
                      onSubmit={(e) => handleComments(e, review.id)}
                    >
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                      />
                      <button>POST</button>
                    </form>
                  )}

                  <hr />
                </div>
              ))}

              <div className="user-review">
                {token ? (
                  <>
                    <p>Rate</p>
                    <StarRating
                      className="star-rating"
                      rating={userRating}
                      onClick={handleStarClick}
                      starSize="3x"
                    />

                    <h5>Review Movie</h5>
                    <hr />
                    <form className="review-form">
                      <input
                        className="review-input"
                        type="text"
                        name="review"
                        placeholder="Add a review..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                      />
                      <button
                        onClick={handleReview}
                        className="save-button"
                        type="submit"
                      >
                        POST
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="login-request">
                    <p>Please log in to make a review or comment.</p>
                    <Link to="/login">
                      <button className="login-link-button">Login</button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <h2>
            We are sorry! No movie was found with this id: {id}. Please try
            again
          </h2>
        )}
      </div>
    </>
  );
}

export default SingleMovie;
