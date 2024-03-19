# The History of Video Games
## Team Members:
- Isaac Favila		ifavila@asu.edu	1223290315
- Tyler Newton		tcnewton@asu.edu	1220651796
- Erin Mccann		ejmccann@asu.edu 1213248385
- Brandon Fenske	bafenske@asu.edu  1215932783

## Overview
Teaser Image:\
![image](https://github.com/asu-cse494-f2023/Brandon-Erin-Isaac-Tyler/assets/137561759/2a68dbb9-3d85-4006-b2ea-16e546e4928a)
Summary:\
In this project, we showcase a captivating journey through the immersive world of video games and consoles, weaving a narrative that intricately connects sales figures, popularity, and cost. Our endeavor is to unveil the story of how these elements have converged, impacting the gaming landscape. Through thoughtful data analysis and insightful research, we will illuminate the rise and fall of gaming systems, the pits, and flows of titles that captured the hearts of players, and the financial considerations that have shaped the industry. By delving into the past, we gain a clearer understanding of the present gaming ecosystem, and from there, project into the future, offering a glimpse of what lies ahead in this ever-evolving realm of entertainment.

## Data Description
Final Datasets:
1. A dataset of the best-selling consoles including the year they were released, the # of units sold, and the best-selling game for that console.
   
   - https://www.kaggle.com/datasets/tayyarhussain/best-selling-consoles-and-their-best-selling-games
     
    - Abstraction:
      
       - Dataset type: tabular
     
      - Attributes Used: 

       - Console: Categorical, Cardinality: 51
      
       - Game: Categorical, Cardinality: 51
      
       - Year of Release: {Ordered, Quantitative, Sequential}. Range: 48. Cardinality: 48
      
       - \# of Units Sold: {Ordered, Quantitative, Sequential}. Range: 82.57. Cardinality: 40
      
3. A dataset of the best-selling video games including the year they were released, the genre of the game, the publisher, and the breakdown of units sold per region.
   
  - https://www.kaggle.com/datasets/sidtwr/videogames-sales-dataset

    - Abstraction
    
      - Dataset type: tabular

      - Attributes Used: 
    
      - Game: Categorical, Cardinality: 1031
      
      - Year: {Ordered, Quantitative, Sequential}. Range: 4
      
      - Genre: Categorical, Cardinality: 15
      
      - Publisher: Categorical, Cardinality: 5
      
      - The last 5 columns share the same type: Ordered, Quantitative, Sequential
      
      - North America: Range: 6.18, Cardinality: 1031
      
      - Europe: Range: 9.71, Cardinality: 1031
      
      - Japan: Range: 2.17, Cardinality: 1031
      
      - Rest_Of_World: Range: 3.02, Cardinality: 1031
      
      - Global: Range: 19.4, Cardinality: 410315
      
## Goals and Tasks
- Discover trends in sales of popular video games over time
  
- Discover trends in the sales of video games and their sequels
  
- Identify the genres of games that have the most sales
  
- Compare the popularity of genres between video games
  
- Identify and compare popular video game publishers
  
- Compare sales of video games by region
  
- Identify popular video games by year and the makeup of their sales across the globe
## Idioms
- The interface we built was a vertical scrolly-telling website using D3 and graph-scroll.js. On the left side of the screen are blocks of text that incorporate a description of the graph displayed on the right side as well as elements of our story being told. As the user scrolls, the graph remains on the screen while the text moves from view, and when the user reaches the next section the graph in the previous section scrolls out of view.

- The implemented visualizations are as follows:
  1. A bar chart. This visualization allows users to compare the number of game genres that have been released per year, and if they choose to they can compare all game genres across the entire timeline. We chose to use a bar chart with distinct colors for each genre so users can visualize and compare how genres change and evolve over the years. Users are able to change the year the graph is displaying, or a collective of all years.
  2. A line graph. This visualization allows users to see the trend of video game sales from 1980 to 2016. We chose to use a line graph so users are able to view the increases and decreases in sales over the years. This graph has no interactions.
  3. A stacked area chart. This visualization is the same as the line graph in that it displays the same information, but the stacked area chart allows users to also see how much of each game genre was released in that specific year. We chose the stacked area chart to accompany the line chart because it displays the same information as the line graph but is much busier visually. This graph has no interactions.
  4. A pie chart. This visualization allows users to see how game genres make up each year. The color of a game genre remains consistent, so as a user cycles through the years they are able to see how much a game genre has shifted in popularity. We chose the pie chart because it conveys how the game genres are composed each year. Users are able to change the year to display the top genres of that year.
  5. Another bar chart. This bar chart shows the total regional sales for only PS4 games. Our dataset included information specific to two consoles, so we chose to make a bar chart visualizing how well games made for PS4 sold in each region. We chose to use a bar chart so users could compare how well the games sold in each region. This graph has no interactions.
  6. A heatmap. This heat map also utilizes the information given for both the PS4 and Xbox One. The heatmap compares how well each genre is sold in each region of the world and allows users to swap between the consoles. We chose to use a heatmap because it conveys the popularity of each genre in a visually distinct way. Users are able to switch between consoles to see top genres for that console.
  7. A scatter plot and pie chart combination. This is our innovative visualization because it blends together a pie chart and a scatterplot to visualize the best-selling games for every console that has been released. The scatterplot portion of this visualization allows users to see what year a game was released, and the pie chart portion of the visualization allows users to see how each region contributed to the total sales for the game. This graph has no interactions.
  8. A scatterplot. This scatterplot compares the number of sales for a game with the user score the game was given after it was released. A scatterplot was chosen to visualize any trends with user scores and total sales for every single game in our dataset. This graph allows the user to change the color type, the possibility to remove outliers, and the ability to change the region.

How are the views linked? Our views are only linked by the story we told in our interface. We did not implement any linking of interaction for our visualizations.

Algorithms used: Almost every algorithm used was a filter to extract the relevant columns from our dataset. Extracting these columns was essential to supporting our idioms because it allowed us to create our visualizations.
## Reflection
Describe how your project developed from an initial proposal to WIP to final product(with changes, challenges, and what we would do different)
    - The initial proposal was a moderately tall task for us as none of our group had been very proficient at using d3. However,
    through doing homework assignments and class sessions we became more familiar with the environment and started to be able to
    realize our proposed graphs. By the WIP, we had created 2 Bar Graphs, a Line Graph, and were able to make an aesthetic looking Stacked Area Chart. From there we piled more until the final product, where we applied most of the graphs we proposed and changed a few. 
The ones we changed included the Map Chart and the original Innovative Visualization. The slide deck proposal turned out to be more unfamiliar then we were expecting and the group decided to change to a ScatterPie chart using Pie Charts to represent individual games on a X/Y axis. The Map Chart changed into a Heat Map which represented the highest selling genres per region with a console comparison functionality. While we completed all of our graphs, we were not without our challenges. Most specifically, the scrollytelling. Isaac was eventually able to navigate this problem and we incorpated the animation style with textboxes in parallel to the graphs on the webpage, but it was a holdup which we had to figure out around the code and the formatting. Overall we had lots of developments with some smaller changes from the original proposal. The team is satisfied with the graph visualizations, but if we could have done one thing differently it would be incorporate more video game style aesthetics into the html/css rather then just focusing on the javascript. Despite this, we are satisfied with the final product and are happy to come away with a new skillset and a well functioning representation of 'The History of Video Games'. Thank you!:)

## Team workload
- Isaac: Worked on the bar chart for genre breakdown, the line graph, the yearly game genre pie chart, and the scrolly-telling functionality.
- Tyler: Created the Region Sales Graph and Correlation of User Score to Sales plot.
- Erin: Created the Stacked Area Chart, and helped create the innovation visualization. I did hovering tech for both. Created narration for half of the charts. 
- Brandon: Created the Heat Map, Contribution to Innovative Visualization, Some Narration, Wrote Proposal, WIP, Created Poster Board
