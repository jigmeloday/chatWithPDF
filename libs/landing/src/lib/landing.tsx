import { Grid } from '@mui/material';
import { Banner }  from '@know-me/banner';
import { Discount } from '@know-me/discount';

export function Home():JSX.Element {
  return (
    <Grid container item>
      <Grid item container>
        <Banner />
      </Grid>
      <Grid container item>
        <Discount />
      </Grid>
      <Grid container item>
        Category
      </Grid>
      <Grid container item>
        Trending
      </Grid>
      <Grid container item>
        Product Preview
      </Grid>
      <Grid container item>
        subscribtion
      </Grid>
    </Grid>
  );
}

export default Home;
