# -*- coding: utf-8 -*-
"""

"""
import control as ctrl
import numpy as np
import matplotlib.pyplot as plt

n = 4
r = 2
dt = 0.1
threshold = 0.001
T = 100

A = np.zeros((2, 2))
B = r * np.array([[1/2, 1/2], [-1/n, 1/n]])
C = np.eye(2)
D = 0

sysc = ctrl.ss(A, B, C, D)
sysd = ctrl.sample_system(sysc, dt)
Ad, Bd, Cd, Dd = sysd.A, sysd.B, sysd.C, sysd.D

Q = np.array([[1, 0], [0, 10000]])
R = 200 * np.eye(2)

K = ctrl.dare(Ad, Bd, Q, R)[-1]

x0 = np.array([0, 0]).T
start_loc = np.array([0, 0])
end_loc = np.array([5, 5])


def angle(vec):
    return np.arctan2(vec[1], vec[0])


def velocity(psi, u):
    return r*np.array([[np.cos(psi)/2, np.cos(psi)/2],
                       [np.sin(psi)/2, np.sin(psi)/2]])@u


def minibot_step(x, u):
    x1 = Ad@x + Bd@u
    displace = velocity(x1[1], u)*dt
    return x1, displace


def target_lqr(y, loc, target):
    vec = target - loc
    ref = np.array([y[0]+np.linalg.norm(vec), angle(vec)])
    y_delta = y - ref
    return -K@y_delta


def hit_target(x0, start, target, T):
    Ts = np.arange(0, T, dt)
    x_log = np.zeros((A.shape[0], len(Ts)))
    u_log = np.zeros((B.shape[1], len(Ts)))
    loc_log = np.zeros((2, len(Ts)))
    x_log[:, 0] = x0
    loc_log[:, 0] = start
    for t in range(len(Ts)-1):
        u_log[:, t] = target_lqr(x_log[:, t], loc_log[:, t], target)
        x_log[:, t+1], displace = minibot_step(x_log[:, t], u_log[:, t])
        loc_log[:, t+1] = loc_log[:, t] + displace
    return x_log, u_log, loc_log


# xs, us, locs = hit_target(x0, np.array([0, 0]), np.array([-5, 5]), T)
# plt.plot(locs[0, :], locs[1, :])


def minibot_lqr(y_delta, xs, us, locs):
    us = np.vstack((us, -K@y_delta))
    xs = np.vstack((xs, Ad@xs[-1, :]+Bd@us[-1, :]))
    locs = np.vstack((locs, locs[-1, :] +
                      velocity(xs[-1, 1], us[-1, :])*dt))
    return xs, us, locs


def minibot_action(yd_func, qty, xs, us, locs, controller=minibot_lqr):
    target = locs[-1, :] + qty*np.array([np.cos(xs[-1, 1]), np.sin(xs[-1, 1])])
    Ts = np.arange(0, T, dt)
    for t in range(len(Ts)-1):
        y_delta = yd_func(qty, xs[-1, :], locs[-1, :], target)
        if np.linalg.norm(y_delta) < threshold:
            break
        xs, us, locs = controller(y_delta, xs, us, locs)
    return xs, us, locs


def yd_turn(turn, y, loc, target):
    ref = np.array([y[0], turn])
    return y - ref


def yd_straight(dist, y, loc, target):
    vec = target - loc
    ref = np.array([y[0]+np.linalg.norm(vec), angle(vec)])
    return y - ref


def minibot_turn(turn, xs, us, locs):
    return minibot_action(yd_turn, turn, xs, us, locs)


def minibot_straight(dist, xs, us, locs):
    return minibot_action(yd_straight, dist, xs, us, locs)


def run_commands(commands, xs=np.array([[0, 0]]),
                 us=np.array([[0, 0]]), locs=np.array([[0, 0]])):
    if len(commands) <= 0:
        return xs, us, locs
    else:
        return run_commands(commands[1:],
                            *commands[0][0](commands[0][1], xs, us, locs))


triangle_commands = ((minibot_straight, 5),
                     (minibot_turn, 2/3*np.pi),
                     (minibot_straight, 5),
                     (minibot_turn, -2/3*np.pi),
                     (minibot_straight, 5))

# xs, us, locs = run_commands(triangle_commands)

pentagon_commands = ((minibot_straight, 5),
                     (minibot_turn, 2/5*np.pi),
                     (minibot_straight, 5),
                     (minibot_turn, 4/5*np.pi),
                     (minibot_straight, 5),
                     (minibot_turn, -4/5*np.pi),
                     (minibot_straight, 5),
                     (minibot_turn, -2/5*np.pi),
                     (minibot_straight, 5))

xs, us, locs = run_commands(pentagon_commands)

plt.plot(locs[:, 0], locs[:, 1])
