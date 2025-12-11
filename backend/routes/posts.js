const express = require('express');
const Post = require('../models/Post');

const router = express.Router();

/**
get all of the posts using API
 */
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error('Error fetching posts', err);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

//creating a new post
router.post('/', async (req, res) => {
  try 
{
    const 
    {
      userId,
      authorName,
      avatarUrl,
      description,
      eventTime,
      location,
      image,
    } = req.body;

    if (!userId || !authorName || !description) 
    {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    //post will have elements filled out by user
    const post = await Post.create(
    {
      userId,
      authorName,
      avatarUrl: avatarUrl || '',
      description,
      eventTime: eventTime || '',
      location: location || '',
      image: image || '',
    });

    res.status(201).json(post);
    //will show error in creating post if error code come sup
  } catch (err) 
  {
    console.error('Error creating post', err);
    res.status(500).json({ message: 'Error creating post' });
  }
});

//functionality for comments
router.post('/:postId/comments', async (req, res) => 
{
  try 
  {
    const { postId } = req.params;
    const { userId, authorName, avatarUrl, text } = req.body;
    //if no words for the comment dont post comment
    if (!userId || !authorName || !text) 
    {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    //case for if the post is deleted/not there and user tries to comment
    const post = await Post.findById(postId);
    if (!post) 
    {
      return res.status(404).json({ message: 'Post not found' });
    }
    //push out the comment
    post.comments.push({
      userId,
      authorName,
      avatarUrl: avatarUrl || '',
      text,
    });
    //save comment in db 
    const updated = await post.save();
    res.status(201).json(updated);
    //if error code show error adding comment
  } catch (err) 
  {
    console.error('Error adding comment', err);
    res.status(500).json({ message: 'Error adding comment' });
  }
});

//delete functionality
router.delete('/:postId/comments/:commentId', async (req, res) => 
{
  try 
  {
    const { postId, commentId } = req.params;

    //WIP may require userID
    const userIdFromToken = req.user?.id;
    const { userId: userIdFromBody } = req.body || {};
    const requesterId = userIdFromToken || userIdFromBody;

    if (!requesterId) 
    {
      return res.status(400).json({ message: 'Missing userId.' });
    }

    const post = await Post.findById(postId);
    if (!post) 
    {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.id(commentId);
    if (!comment) 
    {
      return res.status(404).json({ message: 'Comment not found' });
    }

    //only allow deletion of users own comment
    if (String(comment.userId) !== String(requesterId)) 
    {
      return res
        .status(403)
        .json({ message: 'You can only delete your own comments.' });
    }
    //delete the comment and save to db 
    comment.deleteOne();
    const updated = await post.save();
    res.json(updated);
    //if error code show error deleting comment
  } catch (err) 
  {
    console.error('Error deleting comment', err);
    res.status(500).json({ message: 'Error deleting comment' });
  }
});

//deleting a post functionality 
router.delete('/:postId', async (req, res) => 
{
  try 
  {
    const { postId } = req.params;

    //WIP may switch to jwt
    const userIdFromToken = req.user?.id;
    const { userId: userIdFromBody } = req.body || {};
    const requesterId = userIdFromToken || userIdFromBody;

    if (!requesterId) 
    {
      return res.status(400).json({ message: 'Missing userId.' });
    }

    const post = await Post.findById(postId);
    if (!post) 
    {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Only the user who created the post can delete it
    if (post.userId && String(post.userId) !== String(requesterId)) 
    {
      return res
        .status(403)
        .json({ message: 'You can only delete your own posts.' });
    }
    //this will delete the schema of comments in a post that is deleted
    await post.deleteOne(); 
    res.json({ message: 'Post deleted successfully.', id: postId });
  } catch (err) 
  {
    //if error code show error in deleting post 
    console.error('Error deleting post', err);
    res.status(500).json({ message: 'Error deleting post' });
  }
});

module.exports = router;