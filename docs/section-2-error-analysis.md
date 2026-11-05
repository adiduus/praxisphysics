# Section 2: Error Analysis

## 0. Introduction

Now there's two parts to this, first of all is actually finding the error in a measured quantity, and then second is actually propagating the errors to calculated quantities.

This is the part where a lot of students may get overwhelmed in, but remember, in most experiment problems, a general sense of the technique can be enough — formal exact error analysis is too rigorous for Olympiads, and hence try to make your answer reasonably calculated.

A bit of context, errors can be represented either as ABSOLUTE errors or RELATIVE errors (called percentage errors when expressed as percentage).

ABSOLUTE errors are the magnitude of the errors themselves, the value which we calculate in (1) below.

$$\text{Absolute Error} = \Delta x$$

RELATIVE errors are the absolute errors divided by the determined value itself (hence dimensionless)

$$\text{Relative Error} = \frac{\Delta x}{x}$$

$$\text{Percentage Error} = \left(\frac{\Delta x}{x}\right) \times 100\%$$

---

## 1. Finding the error

### i) Error in Measurement device

For measurement devices which have even divisions and you have to read off them, the error/uncertainty is half the smallest division. This applies to most analogue devices: rulers, analog voltmeters and ammeters, protractors, etc.

There's unfortunately not really an easy way to reduce this error besides just using a more accurate device, that is, the divisions being finer.

### ii) Statistical error

These are fluctuating errors that appear naturally due to unpredictable environmental variances, observer reaction times, or intrinsic system noise.

For these errors, we require repeat measurements of the same event multiple times to get multiple readings. With say $N$ readings:

We first find the mean

$$\bar{x} = \frac{1}{N}\sum_{i=1}^{N} x_i$$

Then we calculate the experimental standard deviation

(by the way we divide by $N-1$ not $N$ here, this is because this is a better estimation of the population [its actual values] distribution from the sample [what we measure] distribution, this is called Bessel's correction if you're curious)

$$\sigma = \sqrt{\frac{1}{N-1}\sum_{i=1}^{N}(x_i - \bar{x})^2}$$

Best to use your calculator's statistics function for this!

Now this isn't QUITE the uncertainty/error in the mean quite yet!

To find the standard error of the mean, do this last step:

$$\Delta\bar{x} = \frac{\sigma}{\sqrt{N}}$$

If the question is structured so that you really cannot make enough time to do this entire process, and the number of measurements is small enough (around 3 to 5), then you can take a VERY rough and informal estimation of the error as:

$$\Delta x = \frac{x_\text{max} - x_\text{min}}{2}$$

---

## 2. Propagating Errors

The formal calculus based method will be introduced a bit later, let's first get used to it's results for the common case where the derived quantity is a sum or a product of different exponents (power law) of the quantities with the error whose value we know.

An important idea is "adding in quadrature", which is to say that we take the square of the terms and add them, then finally take the square root — in a way that's pretty much pythagorean addition.

For sums (and differences) we add the ABSOLUTE errors in quadrature, and scale each of the errors with their coefficients so say for $Q = aP + bT - cL$, we get:

$$\Delta Q = \sqrt{a^2(\Delta P)^2 + b^2(\Delta T)^2 + c^2(\Delta L)^2}$$

For products (and divisions) we add the RELATIVE errors in quadrature (to also get a relative error), and scale each of the errors with their corresponding exponents so say for $Q = P^a T^b / L^c$, we get:

$$\frac{\Delta Q}{Q} = \sqrt{\left(a\,\frac{\Delta P}{P}\right)^2 + \left(b\,\frac{\Delta T}{T}\right)^2 + \left(c\,\frac{\Delta L}{L}\right)^2}$$

Now again, If the question is structured so that you really cannot make enough time to do this entire process, then you can leave the accuracy provided by adding in quadrature and just add the terms normally (but please make all the coefficients positive!), so for the above we get:

$$\Delta Q = |a|\Delta P + |b|\Delta T + |c|\Delta L$$

And

$$\frac{\Delta Q}{Q} = |a|\left(\frac{\Delta P}{P}\right) + |b|\left(\frac{\Delta T}{T}\right) + |c|\left(\frac{\Delta L}{L}\right)$$

You can think of it as calculating the diagonal through a cuboid (not necessarily 3 dimensional though), which basically takes into account all the errors.

> **FIGURE:** cuboid diagonal, $\sqrt{\Delta_X^2 + \Delta_Y^2 + \Delta_Z^2}$

An important caveat in quadrature is that the different errors need to be independent and uncorrelated, this means that how much error is in one variable should not affect the others', say the error in measurement of $d$ by a ruler should not affect the error in measuring $T$ from your stopwatch, this is usually a met condition.

### The max–min method

Now, yeah there's cases like $F = mg\sin\theta$ and there is uncertainty in $\theta$ (the angle), or say $E = k/(n-1)$ and there's uncertainty in $n$. Here the addition case and the power law case doesn't apply. Here an informal method exists, just take the difference in the maximum value of the derived quantity ($F$ or $E$ here) and the minimum value of that quantity and half it.

Actually this is mostly what we do for finding the uncertainty of the gradient too! Unless you go the formal way and use regression (not as common).

$$\Delta q = \frac{q_\text{max} - q_\text{min}}{2}$$

One thing to watch: this works as long as the quantity varies in one direction only over the interval $[x - \Delta x,\ x + \Delta x]$ — that is, it keeps increasing or keeps decreasing. Then the largest and smallest values really do sit at the two ends. If there's a turning point inside the interval, the extreme value is at the turning point rather than at an end, and you'd have to find it there instead. In practice the intervals are small and this rarely bites, but it's worth a glance at the function first.

Lets treat this for our cases:

$$F_\text{max} = mg\sin(\theta + \Delta\theta)$$
$$F_\text{min} = mg\sin(\theta - \Delta\theta)$$

$$\Delta F = \frac{mg\sin(\theta + \Delta\theta) - mg\sin(\theta - \Delta\theta)}{2}$$

To find $\Delta F$.

$$E_\text{max} = \frac{k}{(n - \Delta n) - 1}$$
$$E_\text{min} = \frac{k}{(n + \Delta n) - 1}$$

$$\Delta E = \frac{E_\text{max} - E_\text{min}}{2} = \frac{1}{2}\left[\frac{k}{n - \Delta n - 1} - \frac{k}{n + \Delta n - 1}\right]$$

To find $\Delta E$.

Here be careful! $E(n)$ is a decreasing function (that is to say, as $n$ increases $E$ decreases, or in other words $E'(n) < 0$) so the smaller value of $n$ gives the larger value of $E$.

---

## 3. Now let's get serious (formal) and generalize EVERYTHING

The most general way to look at the relationship between our variables [both the one whose uncertainty we want to know and the ones we already know] is as a function, now what applies to all (assumed continuous) functions in general?

That it can be written as a (infinite) polynomial function! This is called a Taylor Series and to write a function as such is called a Taylor expansion.

If this is your first time learning about Taylor Series, or that your grasp of these concepts are still a bit shaky. You could watch this video: https://www.youtube.com/watch?v=3d6DsjIBzJ4

Now let's write this functional relationship. Say now $Q = f(P, T, L)$.

Now, we can write each of the variables in the functions as $x = x_\text{mean} \pm \Delta x$.

So we get $Q \pm \Delta Q = f(P \pm \Delta P,\ T \pm \Delta T,\ L \pm \Delta L)$.

Now let's do the taylor expansion around the mean:

$$f(\bar{P} \pm \Delta P, \bar{T} \pm \Delta T, \bar{L} \pm \Delta L) = f(\bar{P}, \bar{T}, \bar{L}) + \frac{\partial f}{\partial P}(\pm\Delta P) + \frac{\partial f}{\partial T}(\pm\Delta T) + \frac{\partial f}{\partial L}(\pm\Delta L) + \mathcal{O}(\Delta x^2)$$

Here the partial derivative is used, this means that when we differentiate we only differentiate with respect to $P$ and treat everything else as constants!

Now $\mathcal{O}(\Delta x^2)$ pretty much groups all the higher order terms in order $\Delta x^2$ where $x$ can be $P$, $T$, $L$:

$$\bar{Q} \pm \Delta Q \approx f(\bar{P}, \bar{T}, \bar{L}) + \frac{\partial f}{\partial P}(\pm\Delta P) + \frac{\partial f}{\partial T}(\pm\Delta T) + \frac{\partial f}{\partial L}(\pm\Delta L)$$

$$\pm\Delta Q = \frac{\partial f}{\partial P}(\pm\Delta P) + \frac{\partial f}{\partial T}(\pm\Delta T) + \frac{\partial f}{\partial L}(\pm\Delta L)$$

Now, we're not quite there yet! To deal with the signs, we square both sides.

Now when we square the right hand side, you will notice we get some terms in $\Delta P\,\Delta T$, $\Delta T\,\Delta L$ and $\Delta P\,\Delta L$, these are called cross product terms. When the errors in these three variables are independent (as mentioned earlier), each cross term is just as likely to come out positive as negative — the errors don't know about each other — so over many repeats of the whole experiment they average to zero and we drop them. (For any one single measurement they are of course still there; what we're really calculating is the typical size of $\Delta Q$, not its value on one particular run.) Dropping them, we recover the final:

$$\Delta Q = \sqrt{\left(\frac{\partial f}{\partial P}\right)^2(\Delta P)^2 + \left(\frac{\partial f}{\partial T}\right)^2(\Delta T)^2 + \left(\frac{\partial f}{\partial L}\right)^2(\Delta L)^2}$$

The structure is the exact same as we've seen before, terms added in quadrature, scaled by their partial derivatives.

This might not make much sense yet, so let's apply them to the cases we treated before informally:

### $F = mg\sin\theta$

$$F = f(\theta) = mg\sin\theta$$

$$\frac{\partial F}{\partial\theta} = \frac{d}{d\theta}(mg\sin\theta) = mg\cos\theta$$

$$\Delta F = \sqrt{\left(\frac{\partial F}{\partial\theta}\right)^2(\Delta\theta)^2} = \left|\frac{\partial F}{\partial\theta}\right|\Delta\theta$$

$$\Delta F = (mg\cos\theta)\cdot\Delta\theta$$

BY THE WAY, keep $\theta$ in radians, as we always do in calculus!

This can be easily edited for when we have an error in the mass $m$,

$$F = f(m, \theta) = mg\sin\theta$$

$$\Delta F = \sqrt{\left(\frac{\partial F}{\partial m}\right)^2(\Delta m)^2 + \left(\frac{\partial F}{\partial\theta}\right)^2(\Delta\theta)^2}$$

$$\Delta F = \sqrt{(g\sin\theta\cdot\Delta m)^2 + (mg\cos\theta\cdot\Delta\theta)^2}$$

### $E = k/(n-1)$

$$E = f(n) = k(n-1)^{-1}$$

$$\frac{\partial E}{\partial n} = k\cdot(-1)(n-1)^{-2}\cdot\frac{d}{dn}(n-1) = -\frac{k}{(n-1)^2}$$

$$\Delta E = \sqrt{\left(\frac{\partial E}{\partial n}\right)^2(\Delta n)^2} = \left|\frac{\partial E}{\partial n}\right|\Delta n$$

$$\Delta E = \frac{k}{(n-1)^2}\cdot\Delta n$$

Now remember, you can also sacrifice some accuracy for time AGAIN by NOT adding in quadrature and doing plain addition! That is almost always acceptable in Olympiads. SO for $F$ it would look like:

$$\Delta F_\text{informal} = (g\sin\theta)\cdot\Delta m + (mg\cos\theta)\cdot\Delta\theta$$

Now that was a lot for one section, and to be honest this section will not hold nearly as much raw score value in proportion than the other sections will; actually, there's a phenomenon called Pareto's principle, where its said 20% of the effort causes 80% of the results. I suspect it to be true here as well.
