const robot = require('robotjs');
const { Hardware, getAllWindows, sleep, GlobalHotkey } = require('keysender');

const win = getAllWindows().find(x => x.title == 'World of Warcraft');
const { keyboard, mouse, workwindow } = new Hardware(win.handle);

const TICK_INTERVAL_MS = 100;
const PIXEL_X = 15;
const PIXEL_Y = 10;
const PIXEL_GAP = 16;

const spells = {
  pummel: {
    name: 'Pummel',
    key: 'q',
    settings: {
      minPressDelay: 62,
      maxPressDelay: 97,
      minGcdDelay: 120,
      maxGcdDelay: 697,
    },
  },
  mortalStrike: {
    name: 'Mortal Strike',
    key: 'f1',
    settings: {
      minPressDelay: 68,
      maxPressDelay: 121,
      minGcdDelay: 2,
      maxGcdDelay: 36,
    },
  },
  bloodthirst: {
    name: 'Bloodthirst',
    key: 'f1',
    settings: {
      minPressDelay: 68,
      maxPressDelay: 121,
      minGcdDelay: 2,
      maxGcdDelay: 36,
    },
  },
  execute: {
    name: 'Execute',
    key: 'f6',
    settings: {
      minPressDelay: 48,
      maxPressDelay: 98,
      minGcdDelay: 2,
      maxGcdDelay: 25,
    },
  },
  overpower: {
    name: 'Overpower',
    key: 'f3',
    settings: {
      minPressDelay: 68,
      maxPressDelay: 121,
      minGcdDelay: 2,
      maxGcdDelay: 36,
    },
  },
  whirlwind: {
    name: 'Whirlwind',
    key: 'f3',
    settings: {
      minPressDelay: 68,
      maxPressDelay: 121,
      minGcdDelay: 2,
      maxGcdDelay: 36,
    },
  },
  rend: {
    name: 'Rend',
    key: 'f5',
    settings: {
      minPressDelay: 60,
      maxPressDelay: 114,
      minGcdDelay: 3,
      maxGcdDelay: 42,
    },
  },
  heroicStrike: {
    name: 'Heroic Strikes',
    key: 'f2',
    settings: {
      minPressDelay: 60,
      maxPressDelay: 99,
      minGcdDelay: 167,
      maxGcdDelay: 250,
    },
  },
  cleave: {
    name: 'Cleave',
    key: 'f8',
    settings: {
      minPressDelay: 57,
      maxPressDelay: 99,
      minGcdDelay: 161,
      maxGcdDelay: 244,
    },
  },
  victoryRush: {
    name: 'Victory Rush',
    key: 'f9',
    settings: {
      minPressDelay: 48,
      maxPressDelay: 98,
      minGcdDelay: 12,
      maxGcdDelay: 35,
    },
  },
  sweepingStrikes: {
    name: 'Sweeping Strikes',
    key: 'f',
    settings: {
      minPressDelay: 48,
      maxPressDelay: 98,
      minGcdDelay: 2,
      maxGcdDelay: 25,
    },
  },
  thunderClap: {
    name: 'Thunder Clap',
    key: 'f7',
    settings: {
      minPressDelay: 38,
      maxPressDelay: 131,
      minGcdDelay: 5,
      maxGcdDelay: 29,
    },
  },
  demoShout: {
    name: 'Demoralizing Shout',
    key: '3',
    settings: {
      minPressDelay: 40,
      maxPressDelay: 75,
      minGcdDelay: 5,
      maxGcdDelay: 123,
    },
  },
};

// Globals
let paused = false;
let lastLog = '';

// Welcome message
log('greet', 'Pow is active, waiting for combat...');
log('settings1', 'Settings:');
log('settings2', `  tick interval: ${TICK_INTERVAL_MS}ms`);
log('settings3', `  pixel location: { x: ${PIXEL_X}, y: ${PIXEL_Y} }`);

// Hoykeys
new GlobalHotkey({
  key: '=',
  action: () => {
    paused = !paused;
    log('paused', `Paused: ${paused}`);
  },
});

// mouse.moveTo(PIXEL_X, PIXEL_Y);

setInterval(() => {
  if (!workwindow.isOpen()) {
    log('win_not_found', 'World of Warcraft window not found');
    return;
  }

  if (!workwindow.isForeground()) {
    log('win_not_forground', 'World of Warcraft window not in foreground');
    return;
  }

  if (!paused) {
    const [spec, ...state] = readState(PIXEL_X, PIXEL_Y, PIXEL_GAP, 15);

    if (!spec) {
      arms(state);
    } else {
      fury(state);
    }
  }
}, TICK_INTERVAL_MS);

/**
 * Functions
 */

function readColor(relX, relY) {
  const view = workwindow.getView();
  return robot.getPixelColor(relX + view.x, relY + view.y);
}

function readState(originX, originY, vertGap, numOfPixels) {
  return Array(numOfPixels)
    .fill(0)
    .map((_, index) => {
      const y = originY + vertGap * index;
      return readColor(originX, y) === 'ffffff';
    });
}

function moveMouseTo(relX, relY) {
  const view = workwindow.getView();
  robot.moveMouse(relX + view.x, relY + view.y);
}

function castSpell(action) {
  const { name, key, settings } = action;
  const { minPressDelay, maxPressDelay, minGcdDelay, maxGcdDelay } = settings;

  const gcdDelay = randBetween(minGcdDelay, maxGcdDelay);
  const pressDelay = randBetween(minPressDelay, maxPressDelay);

  sleep(gcdDelay); // Pause before casting to account for sloppyness
  log(key, `${name} (kb: '${key}',  keydown: ${pressDelay}ms, sloppy: ${gcdDelay}ms)`);
  keyboard.sendKey(key, pressDelay);
}

function randBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function log(key, message) {
  if (!key || lastLog !== key) {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const time = `${hours}:${minutes}:${seconds}`;
    console.log(`[${time}] ${message}`);
    lastLog = key;
  }
}

/**
 * Specs
 */

function arms(state) {
  const [
    combat,
    gcd,
    mounted,
    pummel,
    mortalStrike,
    execute,
    overpower,
    rend,
    heroicStrike,
    cleave,
    victoryRush,
    sweepingStrikes,
    thunderClap,
    demoShout,
  ] = state;

  if (combat && !mounted) {
    if (!gcd && pummel) castSpell(spells.pummel);
    if (!gcd && heroicStrike) castSpell(spells.heroicStrike);
    if (!gcd && cleave) castSpell(spells.cleave);
    if (!gcd && sweepingStrikes) castSpell(spells.sweepingStrikes);
    if (!gcd && mortalStrike) castSpell(spells.mortalStrike);
    if (!gcd && execute) castSpell(spells.execute);
    if (!gcd && overpower) castSpell(spells.overpower);
    if (!gcd && victoryRush) castSpell(spells.victoryRush);
    if (!gcd && rend) castSpell(spells.rend);
    if (!gcd && thunderClap) castSpell(spells.thunderClap);
    if (!gcd && demoShout) castSpell(spells.demoShout);
  }
}

function fury(state) {
  const [
    combat,
    gcd,
    mounted,
    pummel,
    bloodthirst,
    whirlwind,
    execute,
    slam,
    rend,
    heroicStrike,
    cleave,
    victoryRush,
    thunderClap,
    demoShout,
  ] = state;

  if (combat && !mounted) {
    if (!gcd && pummel) castSpell(spells.pummel);
    if (!gcd && whirlwind) castSpell(spells.whirlwind);
    if (!gcd && bloodthirst) castSpell(spells.bloodthirst);
    if (!gcd && victoryRush) castSpell(spells.victoryRush);
    if (!gcd && execute) castSpell(spells.execute);
    if (!gcd && slam) castSpell(spells.slam);
    if (!gcd && cleave) castSpell(spells.cleave);
    if (!gcd && heroicStrike) castSpell(spells.heroicStrike);
    if (!gcd && thunderClap) castSpell(spells.thunderClap);
    if (!gcd && demoShout) castSpell(spells.demoShout);
  }
}

/**
 * WeakAuras import string
 *
 * !WA:2!TV1cWXXvwv3zIx7moRxjzBT2ooj9QK1RCIJ8OXFITlCsPrFSLJSK8ms(36T00FEZ0TvpD3U7E0hNpqebJz5ZcILDtTljKi2kfvXUP2iQIpl7waQOGIpfClXYYaeydgiafl)mu8Bty5EFVUNpAgzBj7GzPyQKr9097DV337EUN799ETLovl(P3xhD2XEBPql6TOFLoMvXtBaMD(aJxO1RQ64PZ8sPOnUUNJRBtPSmV0Lu80LhXXXkW01BQHYLZNfCV95nT4k9pY8k2AgoEd7yAhO2DVdosVPNlxrlRUn90Syzt77QOXwRNIwGPJT)bs7hO4fepLPTzqC1C4F8nIptGNz(8mp)TVtVWlV8C6m1I5YnY0UmVJ17ad33OdKka)rALIEkjNX3Lzz1VUF8R6xuLnbZoid2AZPMFSU7kZiJLzKUspsQIOsuDTuMM5vUzd7XWMLoZW9oWaP53r9ymfRaJ02kfy(XNTODOjeFEnhRIfSZqJGyxdhFmpBfRtH2jougFwfBZck0O6aW92hSPu2o2Sfyk(SmbE8z01TOoARulgJSCpFMMJTU)muBOXf8qPkOyAJ9fEi4Hxh8HHDcFe8YnU07KwXYmVnSEpCYJSmP5WrtAwEAgnEklhf9(s5BEjwRPlue9tXtHZoATcDepTMLIVpDLAGIfowPlxun0b3TJLJ3XJfl2WXs0X(NjVNPozwTLUhpXyJzK2xd7xmvbYWyoXF7vppZT5mxSOIhtUp0zlFAdZa2CECtIKXc6tJtNMA59Ck6g2RmOfU2u(oEbWdTOsXae1mKlhveFwFMvooek5idnSQNIUzr)x4ENXZjGp)jDvCMdh82b9Hajhp10D1t)JMjTLzbZGnSGq(ce59mV4x9BJ)i2CboAtiCyRFIF52m1t2xMEMLgPN2upWydZNZd96Odtjqj21eq5(OBrdc1mDNU3EheTIjfyav0kYzMpEYIM6Z)ujh0S9mN9G9o4EtHdZjt1ZqNEWqLlMzLKKInh5YnfJY5nTZ54jWmXNPOpBaY8nAr7vA(kYW7tcwhSEydiAko8(JdBmo8bE5Dcn9AiyyRxfB9ykwtQmTFGxrwwOv4dc7yUUllCyRW2GTehEaUGhJq(zHTd3h0m0c8GXr5CLwxGEIPTMtbvLGSUnt)mpZM5zQLXWzYHSZUyn)8Q(8)0ng8R7mPnPI5fIGMszzNLheoioBT(jU0C0teGSSxLd7mZzQjgR0iWTfrd8YZcsZUyrtpMEwU4MGzyIufgIX0cJWLH8tztQ8bIVOhgDMjsrlEce(OyjJEmZXzlsDVSrKLg)D2QQVPDEl29dNLpbmlxTi)Z4zdNlMx30)cfTrcPjyjvSN2TfTI(bofgre2pGtEtn3DKJ3ch723vCzzpwqrpBzAQpoZw3TzfEVd7XjC0zF(1aFOXHNWdHVd0BFJGSx(kbu0poU6scE0hPvytlIrTuShfuyRFLn72saBQGX8nuWP3ZiGVXMLFp6lypUnvvdQGPUQ4UrHmP6A0rgYDt8BIHvoeatJdVt1f(ZRXFaY5Xey(NFrbm)ScfkTa)5xaNcmZnnS(54XCSrWBMAWHgSxytEOztTzoEd1IincT0Co2bUn1NN5LKpzrfDkqsEKrQzOfQPDSMf53Csme50EkUZC6WlwSSGOOUudI8OHJ8QYTKoD)h9yJim2jm9nvXKlv6iXTSLWbw4mPK72kpvoMiUBm7WlGhs1GzM3iyBQIHBwy39bpgXoc7H)Dc(3DsFZNal6XitLC1UBU7b66edpYqPgORUFQU6PN(hP)t1RAbtpphpd4qEHTFw0eT1PEKo1a9oypWSUhUFkjsoKl58DPRpKT)5pntz8UqCI)5pbt3u58Ji6R)5fSRJrSRCYv4PGbG2ePAQnDr734eiWrfSFWEsRvggHzvCnuILEscvSx4iXHbJdRvcoEmyO51Y3U(HMA)7AV9)4WiBFNP1myAJFaOP1oZekEMk4qlfXoKEcfRISyEAgk25zy(B4L4yJzCX8lmVGPHpfmAC3MXqonmiInwzgDKX7tXnJAj(2iN7RcXhC6qUo4mvO44eBNnBvCBTaNll8rZcNh(y0ZhdjK49wnlOzW7m2CgKdYZzjO(tsLKOzKCGlaJdwqbWomygCa3krVWfVYMbVyGVQGafceMFrycysyky6NhUKe804i5zGNfB(ZbFN8Pc47cEEyMDSg47gEb47bUm89cxb(bqFYhFlW3Ve89Lf(b3g8dXbGDwhauaj)eWpm8JGilyw4hf(K43)yWNog8ksLDRVk50EX9sEVHMV9I6UtDMbkEO9FoYPs4g0XIor4Zqoq4Zc)4WlfdE5Yol4NG7LcrxiQHapvHUwYD24sVZTKR8SlnnvZr(XZkspuajldWCfWMsZP65YGA(oU2rTCuXKbLtqXD7v8YKsqaaQetHsU59XjZRPFN1bJo0vR)OmS41iyc5)54ImhCQZTV9p6rp3(6HWfiC5Mdw8kuSk2HRBbk3KXPLDUuBkhLsD8NmlVVyNQ4avZgjHvCqQxiS5wYjIUoHpK8MLDIltAIg5eP5E0rg5p(Pi)HimfN6dJzw1C6dn)fYT)8xuvT)u(5x1oYWO0xFfgL(G8Ij1u855Sns6Xk0Y(MLwBgFzuBpvAm3Nk2M0SczDBbFmUshSWSXO0ckyj8T9DCeoqGeRz2zl3Gw6K03wvfvk6HsquBhIBA27yDL(e4cbrKZLFgr9R8vL5vexhbVGa6wLfvwcurJLWmb7iv3O962e1i0k0WYmDDMK5Hzgw4uM06kMwoDrFJq0hY)GIAOk2lFiJf2fmkwDTXcvlI2E8eUBP6BuzC(ehrmL9ZIMXNJmdCKSJf7IxCP8O(uQu(entD4IfkWSiTtZZ0Kdc7hB9B7fBaUFvZn0WmAUcnFNMWRQmA)srHhvyWgKZzH8y76mDDIJTlL9RN6Mb1JmeiSh7)T5Kte4I8OLthbFLBJjGwSGyHo(8f6Ch3Ze6mI8o)kKRk0ZGULJe6zYn(Jp85MA4dU3JM5oq9g3EsjP(jJIt5zK(k8ch96DkMwrSiCHFffdjyb11knXeluu3rtm9PJDRVwIFvcyuP6ICfgkXfoQsNtKNadIvtClMuAvhDIpKUBu4j1fr45okbSzhAcMhNKUQvdG(BrzgOx)M3zoRtzr9T9fl(Rt(XWy6WWRig3l2)eNy)9uy4J29(Vvly81xHrNBf(PBzFWNF7WxWdRWFiBRPlZ)2m8Zi8OCI4ndZZzAfjyj5qE8TcVbYh)RjC0lIR8hxhRVy3TwuS7wNW0N2Wi4xGkiHmied86zBqkBU0W00WxOUm0QtTSzOxfXxncOLYdlN6ooLbfgebx(TJajhVCAaCPN9oSzHZnC7dFGGW6CJGl7EnWNnzxd2JkFJe8pCvii8Y1fE5ojafD5lV9wRbnDDwF5kTY1TvgrfXwqp)1ZkCLiCIWvQz5sKedjsr2(DKEyEO(px2kyksfCOdI((fXQaHVCJl4lc9S4XyEoMAHBGzDiPjcwj1iyiK1)lPgHQQEBXiIerAaojs7NCAxR93ts3rp(sbgWVd87(ingrunsyvxVqY5m1CSZ4ueRpFhRrDsL8o93ZSfvhTWbh449oCLIdxulCReYmPPllRBtH7mmBQGrD1vcyQf5)jzrpl3h2iiW1)W7zpK86W0zpzml4AXst7ew3ekN5TNdgX(TtvHOURz1DgtCPbNq85wP54Mj6qLWvkrTtKO7n599bI7v0MFOwPODcgL19VGqzzcuWWo3pCLT1oAtTP1SngZEIo0OvmlJ8m8L(i6g)GRM3N2IuXihEZPU7zllefll(Z8Pnj3mNSTtqf5zHl2s2Xt(OSGrmlWqn(yl5Hpr1kNozLocm8CccSyYbgmBuMYlPhhPI04pL)LLJgwPSW8pICc(9qJPozJdf5JCe5KveUSCo0anXE15UL3xczDNWBhju6CuWN2gTOwxlCK2whDywUnOsOLc2TIDxb08B7TjoSX22nVJ7sUClvS1LBVMzNqJsSxI00ejPUYLJHZS257MF725szx1iLYByChCmghTXB3URt2E0Z2TmYo12UKRylvn6PprZBI)(OYDw(zeuO8vI(ZS8zvnZXNEmTLpDxJ1FaTEx2rPd87eScQmpF0Jx1eAi8GgM97tFhA1rZzlz2QsB7HPOpK3rnC8dNq()qZQXR(V4mKO5pXrQh8koQPQvt5GVpABT9Xqvv7VXX(ttv4GpGo2QNTrDQdFoRqKz2WMi2zF9qXe2KQppSiybfXvJfSCMAhHMvoLkGPvJo5ZA034)loFuvFhpv6axYcFg4pKtCUL4xtWKDQWJTW3DZpn2VYJCsE7o(ZkyxFBormwq3xKshZZBd809lmIrrBDC(VBlf3OS2e77zfLqCZK6xTBlMYe1NZx9teLZ3ETy6(RnoJ52fDc(bPjEEJBPkjFfjVWZ)U5AQEObhoMF5dhJoJdHTERutXsRN4uI6j8UKJnRFD)7QXfwG(qknTkMl1Xl4Q(bMAJpDpHP8mGrB1DRM5TD8yHV7a9sz76Lo6n)SleL(MEbfmOsucRBKQu5jqRMQwzO57JDYPnpzW5s1)fdp3eSAfSiMuxYXPGK7MJKcL2Vht(o0PBO6ZkGZKP7SJeD84Ll05VhERS8t2o6miq0xA(5jIv)KIQ6ilm4PMjkTg9IwSx4vnGMILMZJSbytR1l880nGJ8X)AE(o5coHPn1YoXz431t1mFMaMl)gjlOm1ws5h9t4fJLSqyBtooBA4DsPZ81C)qhddWq5WSLXyTIw6uSOmXVjlYI)Kc1Om16OnyThSpztXtX1SOmh5CESlwKzRn9H90z5ukAfWn9tHwu8fJobq(XjJUxCkmgDm7hJFKQgFn4BrLF9ULKwtSsss)gLKUlQfLKITUss3nD)16(yKfQz54Jz6D4wNilaMWqEANIYtQG0G4t4Rw4jljTUtwsA9zljDpQCQ5dxsAdBHBmLKU3qlOK07NuTuvQ(KvuTeP6MivNGuDbf7P5zV8LTzitdQkvgEPIhDjNGkAkJ0(wc1UBlHh5V8Ki5gV9KPeRktzTctj7LjD9GDZ5Z5VfmYfezfjMzMnRGjZ)jHnHWklmsxLFoQ(psAEt9cFok61s29MIg88Kthg1WeypdCYN3IHTXGuvAATXYr1WHDpA8fyGzcPxuhmpTiV4tk3UUdZNsXAGzffJLCEMipkYpklSiM(Uiv)QHQEU(TLfPpj1xx17hUpE17QcA12CCjQWxQL9wvL84L3ZskQFMOinAXnnytAxL7zq9RWJAmNDMZtl24Gl)mHNnWNlCBdoB5T8JVaVF(Q2DOOv4v1EdC5WcV3QBRH77Vb)1iR6d4qCef18ysnlwZDA7qjO60524n)A)wyctF(bw4rhyX3UVxI4OrRYObx04Xx6(qn08N0oWjqBFN9qNrLOSxfRF8vKUss4RId)FF4RTKDu4pilucRy4pc(JlVGn4nVl4prSgn7v8(q(NIloletwzTzH7k19d)zWvH)C4Va(6WBrI4TfLRqc8nH)s4Vc(RVovr42uMjXceO4wXEi4xxbfjAVCbfcq0F7TqnexJQHa(g1w9a83rfj42KFKP4hAkVhuVa8pSmvka)JW)eLYe(wLtwI8(8RrUFKY(UIssI8)H3(UH3bjllj9(qs91fsTvscPU3qL8B1Ls5gLnRK0gRkdvjPpWQp7ujPMQkDtjPMVozxkj1cLza)Vn)iLOXBRlnFrjPpOixrjPTgMNOK02QMwVK02j68rBf(NZc)l8sMqs4AlxspZ4JE6mg2Setut5sW)Mb8VkHfafffxs6HH)D4)a(p5v)aFtQ0h4DQQMh4DP6DG)ldIsRUayrkKss3hM4iPifsdcKljTdE2IkrYRgiGWDlabcaanDqaJQ9BKtd77ngcSHTiaacNFOO2yJf1nacSHycaGW5hkQMQgcq(FSpxMCCl1)tUCrV4Oacoq4KkqaUYi3EuREvbOyzjc3yvCH3OnRQbNT2BxHBKicjwVhiE4bYiicjsqsuOiiwtIjeLrneHVgNiSMnH)VP(Lr9fVEBA)Y0(kl7Qcj5Q7q1xosYfccx5OgTYX3l4hRpvnYygXp2LepGreAxDCDJdn)MIqxmcMcWPGzmiV6i8DsH8I3If(7jy)Aj0Apr)77cfMIIRdZQ2G939WvhEV36cVBq1HHSsxZOQy9kviE9Zy)CRQm21VDQC0zesf7fHFjO5Bx9omubOELMO6dXcfffG62spScoEkwMxINVgxlwa8Bc)wvkl9nIGMesLoelELMubQ3ymDjP2Rhu7VmG6v7Uh0yq9C644IV2YG)NpL)1mQjFvdxI)XT6B8l4nUZ09KR2Cwi6fr0eWUmKExea)MiN1)FPg3ok1y55fUzx1yufa3oFlqov5J7t8Q8W)xpq1RgBTx3xdGWnVWW92(kXof)F)c0z64Lnm4irv89p27HlkRK0JwZB4HUMZXMYT9boyYrR6n84lHUZix4dcVuYotKi0rkEXa4thOx7a10mCrVIwPAzApo929kA9XEYV02Pp3x9x0iPCWqPusAprsGcUsw5R66vekJ2iGiD(7LH(ms9xetG32t2LO3du7yK00(Q8vd7vz9U)k69RZ)8w1FXYP39vVEpqLVU(6DVv07Bpb)t9xSC6nz969Gv(66R3oRO3VXxM(8vQ)ILkHWol0EljcDVT(EW7mKiWpKkqSnmVXkiWx8wQERg43OtF)uLK29kkI)2W7aujPel)lb0j7X9O6tw8adFUExsuFKRUKuhxNG(YaIdLOQW1vsaFzjCWeRGaEEOEnW3vAaFz9EGeRGaEEO(s07klGVSE3xIvqappuFj6DLfWxwVjtScc45H6lrVR0aEmwNlR6d4BzIV6z(V)d
 */
