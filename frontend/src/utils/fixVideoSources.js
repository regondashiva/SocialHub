import { API_URL } from '../config/api'

// Fix video sources with working URLs
const fixVideoSources = async () => {
  try {
    console.log('🔄 Fixing video sources with working URLs...');
    
    // Get all posts
    const response = await fetch(`${API_URL}/posts`);
    const posts = await response.json();
    
    console.log(`📝 Found ${posts.length} posts`);
    
    // Working video URLs that are known to be accessible
    const workingVideos = [
      'https://www.w3schools.com/html/mov_bbb.mp4',
      'https://www.w3schools.com/html/movie.mp4',
      'https://sample-videos.com/video321/mp4/240/big_buck_bunny_240p_1mb.mp4',
      'https://sample-videos.com/video321/mp4/240/big_buck_bunny_240p_2mb.mp4',
      'https://sample-videos.com/video321/mp4/480/big_buck_bunny_480p_1mb.mp4',
      'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
      'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/BigBuckBunny_360_10s_1MB.mp4',
      'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/BigBuckBunny_720_10s_1MB.mp4',
      'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4',
      'https://file-examples.com/storage/fe86c4e1926ed0cc9b4d3c9/2017/10/file_example_MP4_480_1_5MG.mp4',
      'https://filesamples.com/samples/video/mp4/sample1.mp4'
    ];
    
    // Update first 11 posts to be reels with working video URLs
    const postsToUpdate = posts.slice(0, 11);
    
    for (let i = 0; i < postsToUpdate.length; i++) {
      const post = postsToUpdate[i];
      const videoUrl = workingVideos[i % workingVideos.length];
      
      const updateData = {
        mediaType: 'reel',
        video: videoUrl,
        thumbnail: `https://picsum.photos/seed/reel${i + 1}/400/800.jpg`,
        duration: 180 + (i * 30)
      };
      
      try {
        const updateResponse = await fetch(`${API_URL}/posts/${post.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWEzZDIzMjA2OTU1Nzg2ZWE1NGJlYmYiLCJpYXQiOjE3NzIzNDY4NTksImV4cCI6MTc3MjkxNjU5OX0.pEJsTESjEtKfahQ7OnLKIRMvFFH_yITNPbInPLAkcaE'
          },
          body: JSON.stringify(updateData)
        });
        
        if (updateResponse.ok) {
          console.log(`✅ Updated post ${post.id} with working video: ${videoUrl}`);
        } else {
          console.error(`❌ Failed to update post ${post.id}`);
        }
      } catch (err) {
        console.error(`❌ Error updating post ${post.id}:`, err);
      }
    }
    
    console.log('✅ All posts updated with working video sources!');
    
    // Verify the updates
    const verifyResponse = await fetch(`${API_URL}/posts`);
    const updatedPosts = await verifyResponse.json();
    const reelPosts = updatedPosts.filter(post => post.mediaType === 'reel');
    
    console.log(`📊 Now have ${reelPosts.length} reel posts in database`);
    
    reelPosts.forEach((post, index) => {
      console.log(`🎬 Reel ${index + 1}: ${post.caption ? post.caption.substring(0, 30) + '...' : 'No caption'} | Video: ${post.video ? '✅' : '❌'}`);
      if (post.video) {
        console.log(`🔗 URL: ${post.video}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error fixing video sources:', error);
  }
};

fixVideoSources();
